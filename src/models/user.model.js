const mongoose = require("mongoose");
// NOTE - "validator" external library and not the custom middleware at src/middlewares/validate.js
const validator = require("validator");
const config = require("../config/config");
const bcrypt = require("bcryptjs")
 
// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Complete userSchema, a Mongoose schema for "users" collection
const userSchema = mongoose.Schema(
  { 
    name: {  
      type: String, 
      required: true,    
      trim: true, 
    }, 
    email: { 
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,   
      validate(value) {
        if(!validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      }, 
    },
    password: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
    },
    walletMoney: {
      type: Number,
      required: true,
      default: config.default_wallet_money,
    },
    address: {
      type: String,
      default: config.default_address,
    },
  },
  // Create createdAt and updatedAt fields automatically
  {
    timestamps: true,
  }
);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */
userSchema.static('isEmailTaken', async function (email) {
  const isUser = await this.findOne({ email });
  return !!isUser
});

// userSchema.statics.isEmailTaken = async function (email) {
//   const isUser = await this.findOne({ email });
//   return !!isUser
// };

/**
 * Check if entered password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  const res = await bcrypt.compare(password, user.password);
  return res;
};


/**
 * Check if user have set an address other than the default address
 * - should return true if user has set an address other than default address
 * - should return false if user's address is the default address
 *
 * @returns {Promise<boolean>}
 */
userSchema.methods.hasSetNonDefaultAddress = async function () {
  const user = this;
   return user.address !== config.default_address;
};

/*
 * Create a Mongoose model out of userSchema and export the model as "User"
 * Note: The model should be accessible in a different module when imported like below
 * const User = require("<user.model file path>").User;
 */
/**
 * @typedef User
 */

const User = mongoose.model("User", userSchema);

module.exports = { User };
module.exports.User = User;
