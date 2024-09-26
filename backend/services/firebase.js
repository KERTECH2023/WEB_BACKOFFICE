const { bucket } = require('./config');

const uploadFileWithRetry = (bucketFile, file, retries = 3) => {
  return new Promise((resolve, reject) => {
    const uploadAttempt = (attempt) => {
      const stream = bucketFile.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      stream.on('error', (error) => {
        if (error.code === 503 && attempt < retries) {
          console.log(`Upload failed, retrying attempt ${attempt + 1}...`);
          setTimeout(() => uploadAttempt(attempt + 1), 1000); // Wait 1 second before retrying
        } else {
          reject(error);
        }
      });

      stream.on('finish', async () => {
        try {
          await bucketFile.makePublic();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      stream.end(file.buffer);
    };

    uploadAttempt(0); // Start the first attempt
  });
};

const UploadImage = (req, res, next) => {
  if (!req.files) return next();

  const files = req.files;
  const uploadedFiles = {};
  
  const uploadPromises = Object.keys(files).map((fieldName) => {
    if (!files[fieldName] || !files[fieldName][0]) {
      // Si le champ est undefined ou vide, sauter cet élément
      console.error(`No file found for field: ${fieldName}`);
      return Promise.resolve(); // Retourner une promesse résolue pour éviter d'interrompre Promise.all
    }

    const file = files[fieldName][0];
    const nomeArquivo = Date.now() + '.' + file.originalname.split('.').pop();
    const bucketFile = bucket.file(nomeArquivo);

    return uploadFileWithRetry(bucketFile, file)
      .then(() => {
        const firebaseUrl = `https://storage.googleapis.com/${bucket.name}/${nomeArquivo}`;
        uploadedFiles[fieldName] = firebaseUrl;
      });
  });

  Promise.all(uploadPromises)
    .then(() => {
      req.uploadedFiles = uploadedFiles;
      next();
    })
    .catch((error) => {
      console.error('Failed to upload files:', error);
      next();
    });
};

module.exports = UploadImage;
