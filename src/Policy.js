import { dateISOString, xAmzDate, dateYMD } from './Date'

export default class Policy {  
    static getPolicy(config){
        const policy = () => {
            return {
                expiration: dateISOString,
                conditions: [
                    { bucket: config.bucketName },
                    [
                        "starts-with",
                        "$key",
                        ``
                    ],
                    { acl: "public-read" },
                    ["starts-with", "$Content-Type", ""],
                    { "x-amz-meta-uuid": "14365123651274" },
                    { "x-amz-server-side-encryption": "AES256" },
                    ["starts-with", "$x-amz-meta-tag", ""],
                    {
                        "x-amz-credential": `${config.accessKeyId}/${dateYMD}/${
                            config.region
                            }/s3/aws4_request`
                    },
                    { "x-amz-algorithm": "AWS4-HMAC-SHA256" },
                    { "x-amz-date": xAmzDate }
                ]
            };
        };
        const policyBase64 = new Buffer(JSON.stringify(policy(config, xAmzDate, dateISOString, dateYMD))).toString('base64').replace(/\n|\r/, '');
        return policyBase64
    }
}