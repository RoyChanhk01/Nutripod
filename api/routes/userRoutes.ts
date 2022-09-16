import express from 'express'
import { userController } from '../server'
import { isUserLoggedIn } from '../utilities/guards'

export const userRoutes = express.Router()

userRoutes.post('/login', userController.login)
userRoutes.post('/checkToken', userController.checkUserByToken)
// userRoutes.put("/", userController.get)
// userRoutes.delete("/", userController.get)
userRoutes.get('/dietitians', userController.getAllDietitian)

userRoutes.get('/hkid/:hkid', isUserLoggedIn, userController.getUserByHKID)
