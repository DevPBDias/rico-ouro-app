export function cleanNulls(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (Array.isArray(obj)) {
    return obj
      .map((item) => cleanNulls(item))
      .filter((item) => item !== undefined && item !== null);
  }

  if (typeof obj === "object") {
    const newObj: any = {};
    Object.keys(obj).forEach((key) => {
      const value = cleanNulls(obj[key]);
      if (value !== undefined && value !== null) {
        newObj[key] = value;
      }
    });
    return newObj;
  }

  return obj;
}
