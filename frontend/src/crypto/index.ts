import crypto from "crypto";
const key = process.env.NEXT_PUBLIC_PASSWORD_CRYPTO_KEY || "whatyouwant";

export const cipher = (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const encrypt = crypto.createCipher("des", key);
    const encryptResult =
      encrypt.update(password, "utf8", "base64") + encrypt.final("base64");
    resolve(encryptResult);
  });
};

export const decipher = (password: string) => {
  try {
    const decode = crypto.createDecipher("des", key);
    const decodeResult =
      decode.update(password, "base64", "utf8") + decode.final("utf8"); //

    return decodeResult;
  } catch {
    return "";
  }
};
