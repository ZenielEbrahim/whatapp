const { Router } = require("express");

const userSchema ='userschema'

userSchema.virtual({
    ref:'App',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id:_id.toString()},'secret')
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token

}

userSchema.method.toJSON = function(){
    const user = this;
    const userObject = user.toObject();

    delete userObject.tokens;
    delete userObject.password;
    
    return userObject;
}

userSchema.statics.findByCredentials = async (email, password)=>{

const user = User.findOne({email});
if(!user){
    throw new Error('unable to login')
}
const isMatch = await bcrypt.compare(password, user.password)
if(!isMatch){
    throw new Error('unable to login')
}

return user
}

userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.pre('remove', async function(){
    const user = this;
    await App.FindManyAndDelete({owner:user._id})
    next()
})

const auth = async (req, res, next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, 'secret')
        const user = await User.findOne({_id:decoded._id, 'tokens.token':token})

        req.user = user;
        req.token = token;
        next()
    }catch(e){
        res.status(401).send({error:'Please authenticate!'})
    }
   
}



Router.post('/users', async (req, res) =>{

    const user = new User(req.body);
    try{
     await   user.save()
     await user.generateAuthToken()
     res.status(201).send()
    }catch(e){
        res.status(400).send()
    }

})

Router.post('/users/login', async (req, res) =>{
    try{
        const user = await user.findByCredentials(req.body.email, req.body.password);
        if(!user){
         return   res.status(404).send()
        }
        await user.generateAuthToken()
        res.send()
    }catch(e){
        res.status(400).send()
    }
  

})

