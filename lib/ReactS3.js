import Signature from "./Signature";
import Policy from "./Policy";
import { dateISOString, xAmzDate, dateYMD } from "./Date";
import { throwError } from './ErrorThrower';


class S3FileUpload {
    static async uploadFile(file, config) {

        // Error Thrower :x:
        throwError(config, file);


        // USER CHANGES
        let envShort;
        switch (process.env.NODE_ENV) {
            case 'development' : 
                envShort = 'dev'; break;
            default:
                envShort = 'dev'; break;
        }
        const filePath = envShort + `/${config.dirName}/` +
                        (new Date()).getFullYear() + '-' +
                        ((new Date()).getMonth() +1) + '/' +
                        (new Date()).getTime() + '-' +
                        (Math.random() + '').substr(2, 6) + '/';

        const fd = new FormData();
        const fileName = file.name.replace(/\s/g, '');
        const key = `${filePath}${fileName}`;
        const url = `${config.bucketRoot}`;
        //const url = `${config.bucketRoot}`;
        //const key = `${config.dirName ? config.dirName + "/" : ""}${fileName}`;

        fd.append("key", key);
        fd.append("acl", "public-read");
        fd.append("Content-Type", file.type);
        fd.append("x-amz-meta-uuid", "14365123651274");
        fd.append("x-amz-server-side-encryption", "AES256");
        fd.append("X-Amz-Credential", `${config.accessKeyId}/${dateYMD}/${config.region}/s3/aws4_request`);
        fd.append("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
        fd.append("X-Amz-Date", xAmzDate);
        fd.append("x-amz-meta-tag", "");
        fd.append("Policy", Policy.getPolicy(config));
        fd.append("X-Amz-Signature", Signature.getSignature(config, dateYMD, Policy.getPolicy(config)));
        fd.append("file", file);

        const params = {
            method: "post",
            headers: {
                fd
            },
            body: fd
        };

        const data = await fetch(url, params);
        if (!data.ok) return Promise.reject(data);
        return Promise.resolve({
            bucket: config.bucketName,
            key: `${filePath}${fileName}`,
            location: `${url}${filePath}${fileName}`,
            //key: `${config.dirName ? config.dirName + "/" : ""}${fileName}`,
            //location: `${url}${filePath}${fileName}`,
            result: data
        });
    }
    static async deleteFile(fileName, config) {
        const fd = new FormData();
        const url = `https://${config.bucketName}.s3-${config.region}.amazonaws.com/${config.dirName ? config.dirName + "/" : ""}${fileName}`;
        fd.append("Date", xAmzDate);
        fd.append("X-Amz-Date", xAmzDate);
        fd.append("Authorization", Signature.getSignature(config, dateYMD, Policy.getPolicy(config)));
        fd.append("Content-Type", "text/plain");

        const params = {
            method: "delete",
            headers: {
                fd
            }
        };

        const deleteResult = await fetch(url, params);
        if (!deleteResult.ok) return Promise.reject(deleteResult);
        return Promise.resolve({
            ok: deleteResult.ok,
            status: deleteResult.status,
            message: "File Deleted",
            fileName: fileName
        });
    }
}
const { uploadFile, deleteFile } = S3FileUpload;
export { uploadFile, deleteFile };
export default S3FileUpload;