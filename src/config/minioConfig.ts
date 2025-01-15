import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: String(process.env.MINIO_ENDPOINT) || '192.168.43.110',
  port: Number(process.env.MINIO_PORT),
  useSSL: true,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

export default minioClient;
