//____________________________________Validation:string__________________________________
const isValidString = function (value) {
    if (typeof value === "undefined" || value === null) return false
    if (typeof value !== "string") return false
    if (value.trim().length == 0) return false
    return true;
  
  }
  
  
  
  //________________________________Validation:ValidUrlCode__________________________________
  
  
  
  const isValidURLCode = function (url) {
  
  
  
    const ValidateURLCode = /^[a-z0-9-_]{9}$/;
  
    return ValidateURLCode.test(url)
  
  
  }
  
  
  
  
  //__________________________________________________________________
  
  
  
  module.exports = { isValidURLCode, isValidString }