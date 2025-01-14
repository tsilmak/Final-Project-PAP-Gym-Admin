const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", process.env.UPLOAD_FOLDER_PRESET);

  const response = await fetch(process.env.CLOUDINARY_URL, {
    method: "POST",
    body: formData,
  });
  const responseData = await response.json();

  return responseData;
};

export default uploadFile;
