player
    backend
        config
            database.js
        controllers
            authController.js
            otpController.js
        middleware
            auth.js
        models
            otp.js
            product.js
            user.js
        routes
            otp.js
            auth.js
            cart.js
            products.js
        Test
            test.js
        utils
            generateOTP.js
            sendEmail.js
        server.js
    frontend
        src
            About
                About.js
                About.module.css
            Alert
                Alert.js
                Alert.module.css
            Context
                AlertContext.js
                AuthContext.js
            Home
                Home.js
                home.module.css
            Login
                Login.js
                Login.module.css
            Navbar
                Navbar.js
                Navbar.module.css
            ProductDetail
                ProductDetail.js
                Product.module.css
            Profile
                Profile.js
                Profile.module.css
            Services
                  api.js
            Signup
                Signup.js
                Signup.module.css
            Terms
                Terms.js
                Terms.module.css
            CartItems
                CartItems.js
                CartItems.module.css
            










backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js          
│   ├── otpController.js
│   └── passwordController.js      
├── middleware/
│   ├── auth.js
│   └── rateLimiter.js            
├── models/
│   ├── otp.js
│   ├── product.js
│   └── user.js                  
├── routes/
│   ├── otp.js
│   ├── auth.js
│   ├── cart.js
│   ├── products.js
│   └── password.js                
├── utils/
│   └── sendEmail.js              
├── .env                         
├── package.json                  
└── server.js                     

frontend/src/
├── About/
├── Alert/
├── Context/
├── ForgotPassword/             
│   ├── ForgotPassword.js        
│   └── ForgotPassword.module.css 
├── Home/
├── Login/
│   ├── Login.js                 
│   └── Login.module.css        
├── Navbar/
├── ProductDetail/
├── Profile/
├── CartItems
    CartItems.js
    CartItems.module.css
├── ResetPassword/              
│   ├── ResetPassword.js         
│   └── ResetPassword.module.css  
├── Services/
├── Signup/
├── Terms/
└── App.js                      