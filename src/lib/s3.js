import { S3 } from 'aws-sdk';
import uuidv1 from 'uuid/v1';

import { getFilesData } from '../lib/data';

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  apiVersion: '2006-03-01',
});

const Bucket = process.env.AWS_S3_BUCKET;

export const uploadFiles = async files => {
  const metadata = { objectKeys: [], files: {} };
  const identifier = uuidv1();
  for (const id in files) {
    const key = `${identifier}/${id}.json`;
    const body = { [id]: files[id] };
    const data = await saveFileToS3(key, body);
    metadata.files[id] = { url: data.Location };
    metadata.objectKeys = [...metadata.objectKeys, data.Key];
  }
  const folderKey = `${identifier}/dependencies.json`;
  return saveFileToS3(folderKey, metadata);
};

export const saveFileToS3 = (Key, Body) => {
  const uploadParam = {
    Bucket,
    Key,
    Body: JSON.stringify(Body),
    ACL: 'public-read',
    ContentType: 'application/json',
  };
  return s3.upload(uploadParam).promise();
};

export const saveProfile = async (profileId, repos) => {
  const metadata = { profile: true, files: {}, objectKeys: [] };
  for (const repo of repos) {
    if (repo.files) {
      const objectKeys = await saveProfileFiles(profileId, repo.files);
      metadata.files[repo.name] = {
        private: repo.private,
      };
      metadata.objectKeys = [...metadata.objectKeys, ...objectKeys];
    }
  }
  const key = `${profileId}/dependencies.json`;
  const savedFile = await saveFileToS3(key, metadata);
  return savedFile.Key.split('/')[0];
};

export const saveProfileFiles = async (profileId, files) => {
  const savedObjectKeys = [];
  for (const file of files) {
    const key = `${profileId}/${file.id}.json`;
    const body = { [file.id]: file };
    const data = await saveFileToS3(key, body);
    savedObjectKeys.push(data.Key);
  }
  return savedObjectKeys;
};

export const getObjectList = id => {
  const params = {
    Bucket,
    Prefix: `${id}/`,
  };
  return s3.listObjects(params).promise();
};

export const getFiles = async id => {
  const { objectKeys, selectedDependencies } = await getObjectsMetadata(id);
  const packageFilesContent = {};

  if (objectKeys.length === 0) {
    return {};
  }

  if (selectedDependencies) {
    return { selectedDependencies };
  } else {
    for (const key of objectKeys) {
      const params = { Bucket, Key: key };
      const { Body } = await s3.getObject(params).promise();
      const file = JSON.parse(Body.toString('utf-8'));

      Object.assign(packageFilesContent, file);
    }
    return { packageFilesContent };
  }
};

export const getObjectsMetadata = async id => {
  const params = { Bucket, Key: `${id}/dependencies.json` };
  const { Body } = await s3.getObject(params).promise();
  return JSON.parse(Body.toString('utf-8'));
};

export const getProfileSavedData = async id => {
  const data = await getFiles(id);
  if (!data) {
    return null;
  }

  if (data.selectedDependencies) {
    return { selectedDependencies: data.selectedDependencies };
  }

  const packageFilesContent = getFilesData(data.packageFilesContent);
  return { packageFilesContent };
};

export const saveSelectedDependencies = async (id, selectedDependencies) => {
  const metadata = await getObjectsMetadata(id);
  metadata.selectedDependencies = selectedDependencies;
  return saveFileToS3(`${id}/dependencies.json`, metadata);
};
