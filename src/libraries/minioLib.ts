import minioClient from 'src/config/minioConfig';
import { Express } from 'express';

const uploadFiles = async (files: Express.Multer.File[]) => {
  try {
    console.log('files', files);
    const uploadedFiles = await Promise.all(
      files.map(async (file: Express.Multer.File) => {
        const { originalname, buffer } = file;
        const fileName = `${Date.now()}-${originalname}`;
        console.log('fileName', fileName);
        let destinationObject = 'resume/' + fileName;
        const bucket = process.env.BUCKET;

        console.log('bucket', bucket);
        // Check if the bucket exists, create it if not
        const exists = await minioClient.bucketExists(bucket);
        if (!exists) {
          await minioClient.makeBucket(bucket, 'us-east-1');
          console.log('Bucket ' + bucket + ' created in "us-east-1".');
        }

        // Upload the file
        console.log('uploading file');
        const result = await minioClient.putObject(
          bucket,
          destinationObject,
          file.buffer,
          file.size,
        );
        console.log(
          'File ' +
            fileName +
            ' uploaded to ' +
            bucket +
            '/' +
            destinationObject,
        );
        // Construct the permanent URL
        const fileUrl = `http://${process.env.MINIO_ENDPOINT}/${bucket}/${destinationObject}`;

        console.log('fileUrl', result);
        // Return the result and the URL
        return {
          fileName,
          url: fileUrl, // The permanent URL to access the uploaded file
          result, // The upload result
        };
      }),
    );

    return uploadedFiles; // This will contain an array of objects with fileName, URL, and upload result
  } catch (err) {
    console.error('Error uploading files:', err);
    return err;
  }
};

export default uploadFiles;
