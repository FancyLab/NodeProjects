const createFileQuery = `mutation fileCreate($files: [FileCreateInput!]!) {
  fileCreate(files: $files) {
    files {
      id
      fileStatus
      alt
      createdAt
    }
    userErrors {
      field
      message
    }
  }
}`;

export default createFileQuery;