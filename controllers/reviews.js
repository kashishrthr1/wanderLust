const Listing=require("../models/listing");
const Review=require("../models/reviews");

module.exports.createReview=async (req,res) => {
    // console.log("Received review data:", req.body.review);
 
     let listing = await Listing.findById(req.params.id);
     console.log(listing);
     let newReview = new Review(req.body.review);  
     newReview.author=req.user._id;
     listing.reviews.push(newReview);

     await newReview.save();
     await listing.save();
 
     console.log("Review saved:");
     //res.send("saved");
     req.flash("success","new review created");
     res.redirect(`/listings/${listing._id}`);
 }
 module.exports.deleteReview=async(req,res)=>{
      let{id,reviewId}=req.params;
      await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
      await Review.findByIdAndDelete(reviewId);
      req.flash("success","review deleted");
      res.redirect(`/listings/${id}`);
  };