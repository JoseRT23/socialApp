const User = require("../models/userModel");
const bcrypt = require("bcrypt");

exports.updateUser = async (req, res, next) => {
  if (req.body._id === req.params.idUser || req.body.isAdmin) {
    //Si el usuario solo intenta actualizar su contraseña
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(12);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (error) {
        return res.status(500).json(error);
      }
    }
    //Si el usuario  intenta actualizar su informaciòn
      try {
        let user = await User.findByIdAndUpdate( req.params.idUser, {
            $set: req.body,
        });

        res.status(200).send({message : "Acount has been updated"});

      } catch (error) {
        res.status(500).json(error);
        next();
      }
  } else {
    return res.status(403).send({ message: "You can update only your acount!" });
  }
};

exports.deleteUser = async (req, res, next) => {
  if (req.body._id === req.params.idUser || req.body.isAdmin) {
    //Si el usuario intenta eliminar su informaciòn
      try {
        let user = await User.findByIdAndDelete({  _id : req.params.idUser })
        res.status(200).send({message : "Acount has been deleted"});
      
      } catch (error) {
        res.status(500).json(error);
        next();
      }
  } else {
    return res.status(403).send({ message: "You can delete only your acount!" });
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById({ _id : req.params.idUser });
    const { password, updatedAt, ...other } = user._doc
    res.status(200).json(other);
  } catch (error) {
    res.status(500).send({ message : "This user don't exist"});
    next();
  }
};

exports.followUser = async (req, res, next) => {
    //verificar que el usuario no sea el mismo
    if (req.body._id !== req.params.idUser) {
      try {
        //Usuario al que se va a seguir
        const user = await User.findById(req.params.idUser);
        //Usuario que esta tratando de seguir
        const currentUser = await User.findById(req.body._id);
        //Verificar si el usuario que vamos a seguir no esta seguido ya
        if (!user.followers.includes(req.body.idUser)) {
          await user.updateOne({ $push : { followers: req.body._id } });
          await currentUser.updateOne({ $push : { followings: req.params.idUser } });
          res.status(200).json({ message : "User has been followed" });
        }else {
          res.status(403).json({ message : "You allready follow this user" });
        }
      } catch (error) {
        res.status(500).json(error);
        next();
      }
    }else {
      res.status(403).json({ message : "You can't follow yourself" });      
    }
};

exports.unfollowUser = async (req, res, next) => {
      //verificar que el usuario no sea el mismo
      if (req.body._id !== req.params.idUser) {
        try {
          //Usuario al que se va a seguir
          const user = await User.findById(req.params.idUser);
          //Usuario que esta tratando de seguir
          const currentUser = await User.findById(req.body._id);
          //Verificar si el usuario que vamos a seguir no esta seguido ya
          if (user.followers.includes(req.body._id)) {
            await user.updateOne({ $pull : { followers: req.body._id } });
            await currentUser.updateOne({ $pull : { followings: req.params.idUser } });
            res.status(200).json({ message : "User has been unfollowed" });
          }else {
            res.status(403).json({ message : "You allready unfollow this user" });
          }
        } catch (error) {
          res.status(500).json(error);
          next();
        }
      }else {
        res.status(403).json({ message : "You can't unfollow yourself" });      
      }
};