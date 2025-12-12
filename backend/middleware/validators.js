import mongoose from 'mongoose';

/**
 * Validates a single MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId
 */
export function isValidObjectId(id) {
  return id && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);
}

/**
 * Middleware: Validates ObjectId from route params
 * Usage: router.get("/item/:id", validateParamId('id'), handler)
 */
export function validateParamId(paramName = 'id') {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ 
        message: `Invalid ${paramName}. Must be a valid ObjectId.` 
      });
    }
    
    next();
  };
}

/**
 * Middleware: Validates multiple ObjectId params
 * Usage: router.get("/item/:id/sub/:subId", validateParamIds(['id', 'subId']), handler)
 */
export function validateParamIds(paramNames) {
  return (req, res, next) => {
    for (const paramName of paramNames) {
      const id = req.params[paramName];
      
      if (id && !isValidObjectId(id)) {
        return res.status(400).json({ 
          message: `Invalid ${paramName}. Must be a valid ObjectId.` 
        });
      }
    }
    
    next();
  };
}

/**
 * Middleware: Validates ObjectIds in request body
 * Usage: router.post("/create", validateBodyIds(['classId', 'semesterId']), handler)
 */
export function validateBodyIds(fieldNames) {
  return (req, res, next) => {
    for (const fieldName of fieldNames) {
      const id = req.body[fieldName];
      
      // Skip if field is optional and not provided
      if (id === undefined || id === null) continue;
      
      if (!isValidObjectId(id)) {
        return res.status(400).json({ 
          message: `Invalid ${fieldName}. Must be a valid ObjectId.` 
        });
      }
    }
    
    next();
  };
}

/**
 * Validates request body against a schema
 * Usage: validateBody({
 *   title: { type: 'string', required: true, maxLength: 100 },
 *   age: { type: 'number', min: 0, max: 120 }
 * })
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      
      // Check required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      
      // Skip further validation if field is optional and not provided
      if (!rules.required && (value === undefined || value === null)) {
        continue;
      }
      
      // Type validation
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push(`${field} must be a string`);
      } else if (rules.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push(`${field} must be a number`);
        }
      } else if (rules.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`${field} must be a boolean`);
      } else if (rules.type === 'array' && !Array.isArray(value)) {
        errors.push(`${field} must be an array`);
      } else if (rules.type === 'objectId' && !isValidObjectId(value)) {
        errors.push(`${field} must be a valid ObjectId`);
      } else if (rules.type === 'date') {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(`${field} must be a valid date`);
        }
      }
      
      // String validations
      if (rules.type === 'string' && typeof value === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} has invalid format`);
        }
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
        }
      }
      
      // Number validations
      if (rules.type === 'number' && typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
          errors.push(`${field} must be at most ${rules.max}`);
        }
        if (rules.integer && !Number.isInteger(value)) {
          errors.push(`${field} must be an integer`);
        }
      }
      
      // Array validations
      if (rules.type === 'array' && Array.isArray(value)) {
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must have at least ${rules.minLength} items`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must have at most ${rules.maxLength} items`);
        }
        
        // Validate array items
        if (rules.items) {
          if (rules.items === 'objectId') {
            value.forEach((item, index) => {
              if (!isValidObjectId(item)) {
                errors.push(`${field}[${index}] must be a valid ObjectId`);
              }
            });
          } else if (rules.items === 'string') {
            value.forEach((item, index) => {
              if (typeof item !== 'string') {
                errors.push(`${field}[${index}] must be a string`);
              }
            });
          } else if (rules.items === 'number') {
            value.forEach((item, index) => {
              if (typeof item !== 'number') {
                errors.push(`${field}[${index}] must be a number`);
              }
            });
          }
        }
      }
      
      // Custom validation function
      if (rules.custom && typeof rules.custom === 'function') {
        const customError = rules.custom(value, req.body);
        if (customError) {
          errors.push(customError);
        }
      }
    }
    
    if (errors.length > 0) {
      console.error(errors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors 
      });
    }
    
    next();
  };
}

/**
 * Sanitizes an array of objects with _id fields
 * Validates that each object has a valid _id ObjectId
 */
export function sanitizeObjectIdArray(arr, fieldName = 'items') {
  if (!Array.isArray(arr)) {
    throw new Error(`${fieldName} must be an array`);
  }
  
  return arr.map((item, index) => {
    if (typeof item === 'string') {
      if (!isValidObjectId(item)) {
        throw new Error(`${fieldName}[${index}] must be a valid ObjectId`);
      }
      return new mongoose.Types.ObjectId(item);
    }
    
    if (item && typeof item === 'object' && item._id) {
      if (!isValidObjectId(item._id)) {
        throw new Error(`${fieldName}[${index}]._id must be a valid ObjectId`);
      }
      return new mongoose.Types.ObjectId(item._id);
    }
    
    throw new Error(`${fieldName}[${index}] must have a valid _id field`);
  });
}

/**
 * Sanitizes a string array to prevent NoSQL injection
 */
export function sanitizeStringArray(arr, fieldName = 'items', maxLength = 50) {
  if (!Array.isArray(arr)) {
    throw new Error(`${fieldName} must be an array`);
  }
  
  return arr.map((item, index) => {
    if (typeof item !== 'string') {
      throw new Error(`${fieldName}[${index}] must be a string`);
    }
    
    if (item.length > maxLength) {
      throw new Error(`${fieldName}[${index}] exceeds maximum length of ${maxLength}`);
    }
    
    // Remove any potential NoSQL operators
    if (item.startsWith('$')) {
      throw new Error(`${fieldName}[${index}] cannot start with $`);
    }
    
    return item;
  });
}

/**
 * Safely converts a value to ObjectId
 * Throws error if invalid
 */
export function toObjectId(value, fieldName = 'id') {
  if (!isValidObjectId(value)) {
    throw new Error(`Invalid ${fieldName}`);
  }
  return new mongoose.Types.ObjectId(value);
}

/**
 * Validates and sanitizes filter objects for queries
 * Prevents injection through query operators
 */
export function sanitizeQueryFilter(filter) {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(filter)) {
    // Don't allow keys starting with $
    if (key.startsWith('$')) {
      throw new Error('Query keys cannot start with $');
    }
    
    // If value is an object, it might contain operators
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Only allow specific MongoDB operators
      const allowedOperators = ['$eq', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin'];
      
      for (const opKey of Object.keys(value)) {
        if (opKey.startsWith('$') && !allowedOperators.includes(opKey)) {
          throw new Error(`Operator ${opKey} is not allowed`);
        }
      }
    }
    
    sanitized[key] = value;
  }
  
  return sanitized;
}

/**
 * Middleware: Prevents any object-type query parameters
 * Use this for routes that should only receive scalar values
 */
export function preventObjectParams() {
  return (req, res, next) => {
    // Check params
    for (const [key, value] of Object.entries(req.params)) {
      if (typeof value === 'object' && value !== null) {
        return res.status(400).json({ 
          message: `Parameter ${key} cannot be an object` 
        });
      }
    }
    
    // Check query
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'object' && value !== null) {
        return res.status(400).json({ 
          message: `Query parameter ${key} cannot be an object` 
        });
      }
    }
    
    next();
  };
}

/**
 * Validates date ranges
 */
export function validateDateRange(startDateField = 'startDate', endDateField = 'endDate') {
  return (req, res, next) => {
    const startDate = req.body[startDateField];
    const endDate = req.body[endDateField];
    
    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ 
          message: `${startDateField} must be a valid date` 
        });
      }
    }
    
    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ 
          message: `${endDateField} must be a valid date` 
        });
      }
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start > end) {
        return res.status(400).json({ 
          message: `${startDateField} must be before ${endDateField}` 
        });
      }
    }
    
    next();
  };
}