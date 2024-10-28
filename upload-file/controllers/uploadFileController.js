import stagedUploadsQuery from "../graphql/stagedUploadsQuery.js";
import FormData from "form-data";
import FileContentType from "../graphql/types/FileContentType.js";
import createFileQuery from "../graphql/createFileQuery.js";
import axios from "axios";

const uploadFile = async (req, res) => {
  try {
    const { file } = req;
    const token = req.headers["x-shopify-access-token"];
    const adminUrl = req.headers["x-shopify-api-domain"];
    const type = req.query.type || null;

    if (!file) return res.status(400).json({ error: "No file uploaded." });
    if (!token) return res.status(400).json({ error: "Shopify Access Token is required." });
    if (!adminUrl) return res.status(400).json({ error: "Shopify Admin URL is required." });
    if (!type) return res.status(400).json({ error: "Shopify file type query is required." });

    const fileSize = file.size;
    const fileName = file.originalname;

    const stagedUploadsVariables = {
      input: {
        filename: fileName,
        fileSize: String(fileSize),
        httpMethod: "POST",
        mimeType: file.mimetype,
        resource: "FILE",
      },
    };

    const stagedUploadsResponse = await axios.post(
      `${adminUrl}/graphql.json`,
      { query: stagedUploadsQuery, variables: stagedUploadsVariables },
      { headers: { "X-Shopify-Access-Token": token } }
    );

    const target = stagedUploadsResponse.data.data?.stagedUploadsCreate?.stagedTargets?.[0];
    if (!target) throw new Error("Failed to obtain upload target from Shopify.");

    const { parameters, url: targetUrl, resourceUrl } = target;
    const form = new FormData();
    parameters.forEach(({ name, value }) => form.append(name, value));
    form.append("file", file.buffer, { filename: fileName, contentType: file.mimetype });

    const headers = { ...form.getHeaders(), ...(targetUrl.includes("amazon") ? { "Content-Length": fileSize + 5000 } : {}) };
    await axios.post(targetUrl, form, { headers });

    const createFileVariables = {
      files: {
        alt: "alt-tag",
        contentType: FileContentType[type],
        originalSource: resourceUrl,
      },
    };

    const createFileResponse = await axios.post(
      `${adminUrl}/graphql.json`,
      { query: createFileQuery, variables: createFileVariables },
      { headers: { "X-Shopify-Access-Token": token } }
    );

    const fileId = createFileResponse.data.data?.fileCreate?.files?.[0]?.id;
    if (!fileId) throw new Error("File creation failed on Shopify.");

    const getFileUrlQuery = `query {
      node(id: "${fileId}") {
        id
        ... on GenericFile {
          url
        }
        ... on MediaImage {
          image {
              url
          }
        }
        ... on Video {
            sources {
                url
            }
        }
      }
    }
    `;

    const getFileUrlResponse = await axios.post(
      `${adminUrl}/graphql.json`,
      { query: getFileUrlQuery },
      { headers: { "X-Shopify-Access-Token": token } }
    );

    let fileUrl = ''

    if (type === "image") {
      fileUrl = getFileUrlResponse.data.data?.node?.image?.url;
    } else if (type === "video") {
      fileUrl = getFileUrlResponse.data.data?.node?.sources?.[0]?.url;
    } else {
      fileUrl = getFileUrlResponse.data.data?.node?.url;
    }
    if (!fileUrl) throw new Error("Failed to retrieve file URL.");

    res.status(200).json({ link: fileUrl });
  } catch (error) {
    console.error("File upload error:", error.message);
    res.status(500).json({ error: true, message: error.message || "Server Error" });
  }
};

const uploadFileController = { uploadFile };
export default uploadFileController;
