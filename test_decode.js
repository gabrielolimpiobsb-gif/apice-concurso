const idToken = "header.eyJ1c2VyX2lkIjoiMTIzNDUiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.signature";
const base64Url = idToken.split('.')[1];
const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
console.log(JSON.parse(jsonPayload));
