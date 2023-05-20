const httpStatus = require("http-status");
const { Cart, Product, User } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods
 
/** 
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError 
 * --- status code  - 404 NOT FOUND 
 * --- message - "User does not have a cart"
 * 
 * @param {User} user
 * @returns {Promise<Cart>} 
 * @throws {ApiError} 
 */
const getCartByUser = async (user) => {
  console.log("getCartByUser: ", user)
  const cart = await Cart.findOne({email: user.email});
  if(!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart.");
  } 
  return cart;
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  let cart = await Cart.findOne({ email: user.email });

  if(!cart) {
    console.log("We are here");
    // const productToAdd = await Product.findById(productId);
    // if(!productToAdd) {
    //   throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
    // }

    cart = await Cart.create({ email: user.email });

    if(!cart) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error.");
    }
    
    // cart = newCart;
    // await newCart.save();
    // return newCart;
  }

  // console.log("cartItems: ", cart.cartItems);
  const productToAdd = await Product.findById(productId);

  if(!productToAdd) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
  }
  
  const isProductInCart = cart.cartItems.filter((item) => productId == item.product._id);
  if(isProductInCart.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product already in cart. Use the cart sidebar to update or remove product from cart");
  }


  cart.cartItems.push({
    product: productToAdd, 
    quantity: quantity
  })
  
  await cart.save();

  return cart;
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  const cart = await Cart.findOne({ email: user.email });
  if(!cart) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart. Use POST to create cart and add a product");
  }

  const productToAdd = await Product.findById(productId);
  if(!productToAdd) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart. Use POST to create cart and add a product");
  }

  // let index = -1;
  // for (let i = 0; i < cart.cartItems.length; i++) {
  //   if(productId == cart.cartItems[i].product._id) {
  //     index = i;
  //   }
  // }
  const productIndex = cart.cartItems.findIndex(item => item.product._id == productId);

 if(productIndex ===-1){
  throw new ApiError(httpStatus.BAD_REQUEST,"Product not in cart")
 }
   cart.cartItems[productIndex].quantity = quantity;

  // if(index < 0) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  // } else {
  //   cart.cartItems[index].quantity = quantity;
  // }

  await cart.save();

  return cart;
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  let cart = await Cart.findOne({ email: user.email });
  if(!cart) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
  }

  // let index = -1;
  // console.log("Cart Items: ", cart.cartItems);
  // for (let i = 0; i < cart.cartItems.length; i++) {
  //   if(productId == cart.cartItems[i].product._id) {
  //     index = i;
  //   }
  // }
  console.log("before", cart)
  let index = cart.cartItems.findIndex((item) => item.product._id == productId);


console.log("afer", cart)
  console.log("Index: ", index);
  if(index == -1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  } 
    cart.cartItems.splice(index, 1);

  await cart.save();


};


// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {
  const cartData = await Cart.findOne({email: user.email});

  if (!cartData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart")
  } 
  
  if (!cartData.cartItems.length) {
    throw new ApiError(httpStatus.BAD_REQUEST);
  } 
  
  const isNonDefaultAddressSet = await user.hasSetNonDefaultAddress();
  if(!isNonDefaultAddressSet) {
    throw new ApiError(httpStatus.BAD_REQUEST);
  }
  
  let totalCostOfProducts = 0;
  for(let i = 0; i < cartData.cartItems.length; i++) {
    totalCostOfProducts += cartData.cartItems[i].product.cost * cartData.cartItems[i].quantity
  }

  if(user.walletMoney < totalCostOfProducts) {
    throw new ApiError(httpStatus.BAD_REQUEST);
  }

  user.walletMoney = user.walletMoney - totalCostOfProducts;
  cartData.cartItems = [];

  return await cartData.save();
};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout, 
};
