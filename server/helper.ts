// const crypto = require('crypto');
// import crypto from 'crypto'
// import "dotenv/config";

import { NextFunction, Request, Response } from "express";

function toCamelCaseKey(str: string) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function convertKeysToCamelCase(
  input: any,
  options?: {
    currentPage?: number;
    total?: number;
    totalPages?: number;
    placeholder?: string;
  }
): any {
  if (Array.isArray(input)) {
    const transformedArray = input.map(item => convertKeysToCamelCase(item, options));

    // If metadata and placeholder are provided, wrap the array
    if (options?.placeholder) {
      const result: Record<string, any> = {
        [options.placeholder]: transformedArray,
      };

      if (options.currentPage !== undefined)
        result.currentPage = options.currentPage;
      if (options.total !== undefined) result.total = options.total;
      if (options.totalPages !== undefined)
        result.totalPages = options.totalPages;

      return result;
    }

    return transformedArray;
  }

  // if (input !== null && typeof input === 'object') {
  //   const result: Record<string, any> = {};
  //   for (const key in input) {
  //     const camelKey = toCamelCaseKey(key);
  //     const value = input[key];
  //     console.log(`Converting key: ${key} to ${camelKey}. Value: ${value}`); // Debugging line

  //     result[camelKey] = convertKeysToCamelCase(value); // recurse
  //   }
  //   return result;
  // }

  if (input !== null && typeof input === "object") {
    const result: Record<string, any> = {};
    for (const key in input) {
      const camelKey = toCamelCaseKey(key);
      let value = input[key];

      // Check if value is a Date or a string that looks like a datetime
      if (
      value instanceof Date ||
      (typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?$/.test(value))
    ) {
      // Convert to "yyyy-MM-dd HH:mm"
      const dateObj = new Date(value);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const hh = String(dateObj.getHours()).padStart(2, "0");
      const min = String(dateObj.getMinutes()).padStart(2, "0");
      value = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    } else {
      value = convertKeysToCamelCase(value); // recurse
    }

      result[camelKey] = value;
    }
    return result;
  }

  // Primitive
  return input;
}


export function convertKeysToCamelCaseWithISO(
  input: any,
  options?: {
    currentPage?: number;
    total?: number;
    totalPages?: number;
    placeholder?: string;
  }
): any {
  if (Array.isArray(input)) {
    const transformedArray = input.map(item => convertKeysToCamelCaseWithISO(item, options));

    // If metadata and placeholder are provided, wrap the array
    if (options?.placeholder) {
      const result: Record<string, any> = {
        [options.placeholder]: transformedArray,
      };

      if (options.currentPage !== undefined)
        result.currentPage = options.currentPage;
      if (options.total !== undefined) result.total = options.total;
      if (options.totalPages !== undefined)
        result.totalPages = options.totalPages;

      return result;
    }

    return transformedArray;
  }

  if (input !== null && typeof input === "object") {
    const result: Record<string, any> = {};
    for (const key in input) {
      const camelKey = toCamelCaseKey(key);
      let value = input[key];

      // Check if value is a Date or a string that looks like a datetime
      if (
      value instanceof Date ) {
      // Convert to "yyyy-MM-dd HH:mm"
      const dateObj = new Date(value).toISOString();
      value = dateObj
    } else {
      value = convertKeysToCamelCaseWithISO(value); // recurse
    }

    //console.log(`Converting key: ${key} to ${camelKey}. Value: ${value}`); 

      result[camelKey] = value;
    }
    return result;
  }

  // Primitive
  return input;
}

export function objectGUIDToUUID(guidString: string) {
  const buffer = Buffer.from(guidString, 'binary');
  const hex = buffer.toString('hex')
  const part1 = hex.slice(6, 8) + hex.slice(4, 6) + hex.slice(2, 4) + hex.slice(0, 2);
  const part2 = hex.slice(10, 12) + hex.slice(8, 10);
  const part3 = hex.slice(14, 16) + hex.slice(12, 14);
  const part4 = hex.slice(16, 20);
  const part5 = hex.slice(20);
  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

export function checkRole(allowedRole: string){
  return function(req: Request, res: Response, next: NextFunction){
    const userRoleArr: string[] = req.user.group.split(':')
    const allowedRoleArr = allowedRole.split(':')
    const isAllowed = userRoleArr.some(c => allowedRoleArr.includes(c))
    if(!isAllowed) return res.status(403).json({message: `You don't have persmission!`})
    next()
  }
}

// crypto-util.js

// Use a 32-byte key and a 16-byte IV
// const algorithm = 'aes-256-cbc';
// const password = process.env.JWT_SECRET!; // Use env var in production
// const key = password && crypto.scryptSync(password, 'salt', 32);
// const iv = Buffer.alloc(16, 0); // Static IV (for consistent decrypts)

// export function encrypt(text: string) {
//   const cipher = crypto.createCipheriv(algorithm, key, iv);
//   const encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
//   return encrypted;
// }

// export function decrypt(encryptedText: string) {
//   const decipher = crypto.createDecipheriv(algorithm, key, iv);
//   const decrypted = decipher.update(encryptedText, 'hex', 'utf8') + decipher.final('utf8');
//   return decrypted;
// }

