const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});


module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});

    res.render("listings/index",{allListings});

};
module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new");
 };
 module.exports.showListing=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",populate:{
      path:"author",
    },
   }).populate("owner");
   if(!listing){
      req.flash("error","Listing does not exists");
        return res.redirect("/listings");
   }
    res.render("listings/show",{listing});
 };
 module.exports.createListing=async(req,res,next)=>{
    //let {title,description,image,price,country,loaction}=req.body;
    // let listing=req.body.listing;
    let response=await geocodingClient.forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
      .send();

    let url=req.file.path;
    let filename=req.file.filename;
    
     const newListing=new Listing(req.body.listing);
     newListing.owner=req.user._id;
     newListing.image={url,filename};
     newListing.geometry=response.body.features[0].geometry;
     let savedListing=await newListing.save();


     req.flash("success","new listing created!");
     res.redirect("/listings");
    //const user1=new Listing({})
 };
 module.exports.renderEditform=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
       req.flash("error","Listing does not exists");
        return res.redirect("/listings");
    }
    let orignalImageUrl=listing.image.url;
    orignalImageUrl=orignalImageUrl.replace(/\/upload/,"/upload/w_200");
    console.log("Updated Image URL:", orignalImageUrl);
    res.render("listings/edit",{listing,orignalImageUrl});
 };
 module.exports.editListing=async(req,res)=>{
    let {id}=req.params;

    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file!=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }

    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
    
    };
    module.exports.deleteListing=async(req,res)=>{
    let{id}=req.params;
    let deletedList=await Listing.findByIdAndDelete(id);
    console.log(deletedList);
    req.flash("success","Listing deleted");
    res.redirect("/listings");
    };