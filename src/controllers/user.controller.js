const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync"); 
const userService  = require("../services/user.service");

// const userServiceInstance = new userService();
 
// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement getUser() function
/**
 * Get user details
 *  - Use service layer to get User data
 *  
 *  - If query param, "q" equals "address", return only the address field of the user
 *  - Else, 
 *  - Return the whole user object fetched from Mongo

 *  - If data exists for the provided "userId", return 200 status code and the object
 *  - If data doesn't exist, throw an error using `ApiError` class
 *    - Status code should be "404 NOT FOUND"
 *    - Error message, "User not found"
 *  - If the user whose token is provided and user whose data to be fetched don't match, throw `ApiError`
 *    - Status code should be "403 FORBIDDEN"
 *    - Error message, "User not found"
 *
 *  
 * Request url - <workspace-ip>:8082/v1/users/6010008e6c3477697e8eaba3
 * Response - 
 * {
 *     "walletMoney": 500,
 *     "address": "ADDRESS_NOT_SET",
 *     "_id": "6010008e6c3477697e8eaba3",
 *     "name": "crio-users",
 *     "email": "crio-user@gmail.com",
 *     "password": "criouser123",
 *     "createdAt": "2021-01-26T11:44:14.544Z",
 *     "updatedAt": "2021-01-26T11:44:14.544Z",
 *     "__v": 0
 * }
 * 
 * Request url - <workspace-ip>:8082/v1/users/6010008e6c3477697e8eaba3?q=address
 * Response - 
 * {
 *   "address": "ADDRESS_NOT_SET"
 * }
 * 
 *
 * Example response status codes:
 * HTTP 200 - If request successfully completes
 * HTTP 403 - If request data doesn't match that of authenticated user
 * HTTP 404 - If user entity not found in DB
 * 
 * @returns {User | {address: String}}
 *
 */ 

const getUser = catchAsync(async (req, res) => {
  let userResult;
  console.log("req.params.id: ", req.params.userId);


  if(req.query.q == 'address') {
    userResult = await userService.getUserAddressById(req.params.userId)
  } else {
    userResult = await userService.getUserById(req.params.userId);
  }

  console.log(userResult);

  if(!userResult){
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if(req.user.email !== userResult.email) {
    throw new ApiError(httpStatus.FORBIDDEN, "User not found");
  }

  if(req.query.q == 'address') {
    res.status(200).send({
      address: userResult.address,
    });
  }
  res.status(200).send(userResult);
});
 


const setAddress = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.email != req.user.email) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "User not authorized to access this resource"
    );
  }

  if(!req.body.address) {
    res.status(httpStatus.BAD_REQUEST).send("Please provide the address string.")
  }

  if(req.body.address.length < 21) {
    res.status(httpStatus.BAD_REQUEST).send("Address field must be atleast 20 characters long.")
  }

  const address = await userService.setAddress(user, req.body.address);

  res.send({
    address: address,
  });
});

module.exports = {
  getUser,
  setAddress,
};
