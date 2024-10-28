# File Upload API Usage

This guide explains how to use the API for uploading files, allowing you to specify the file type as an image, general file, or video. The example code demonstrates a POST request to upload a file to the server and retrieve the uploaded file's link.

## Prerequisites

- Ensure `fetch` API support (available in most modern browsers and Node.js).
- The server should be running  `https://api.example.com` and should support the `/api/v1/upload-file` endpoint.

## Endpoint

`POST https://api.example.com/api/v1/upload-file?type=image|file|video`

## Headers

The following headers are required:

- `X-Shopify-Api-Domain`: This should be your Shopify store’s API URL.
- `X-Shopify-Access-Token`: This should be your Shopify access token, allowing access to protected endpoints.

## Request Parameters

- **Method**: `POST`
- **Query Parameter**: `type` should be set to either `image`, `file`, or `video` depending on the file type you want to upload.
- **Body**: A `FormData` object containing the file to be uploaded.

## Response

The response will return a JSON object with a `link` field containing the URL to the uploaded file if successful.

## Usage Example

Here's a JavaScript example demonstrating how to call this API:

```javascript
const uploadFile = async (fileType) => {
  try {
    const formData = new FormData();
    formData.append('file', fileInput.files[0]); // Assumes an input field with a file selection

    const response = await fetch(`https://api.example.com/api/v1/upload-file?type=${fileType}`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-Shopify-Api-Domain': 'https://example.myshopify.com/admin/api/2024-10',
        'X-Shopify-Access-Token': 'shpat_11111111111CCC45645646'
      }
    });

    const { data:{ link } } = await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};

// You can also use 'file' or 'video' as fileType
uploadFile('image')  
