import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Principal "mo:core/Principal";

module {
  public type Category = {
    #news;
    #reviews;
    #comparisons;
    #electric;
    #racing;
    #concepts;
    #buyingGuides;
  };

  public type Region = {
    #asia;
    #europe;
    #usa;
    #middleEast;
  };

  public type Score = {
    performance : Nat8;
    design : Nat8;
    comfort : Nat8;
    value : Nat8;
  };

  public type PriceRange = {
    min : Nat;
    max : Nat;
  };

  public type TimeValue = Int;
  public type ContentStatus = { #draft; #published };

  public type ImageType = {
    #uploaded : Blob;
    #linked : Text;
  };

  public type ColorOption = {
    name : Text;
    colorCode : Text;
    images : [ImageType];
  };

  public type ContentType = {
    #news;
    #review;
  };

  public type OldReview = {
    id : Nat;
    title : Text;
    content : Text;
    author : Text;
    score : Score;
    bikeId : Nat;
    region : Region;
    createdAt : TimeValue;
    createdBy : Principal;
    hidden : Bool;
    status : ContentStatus;
    contentType : ?ContentType;
  };

  public type OldActor = {
    reviews : List.List<OldReview>;
  };

  public type Review = {
    id : Nat;
    title : Text;
    content : Text;
    author : Text;
    score : Score;
    bikeId : Nat;
    region : Region;
    createdAt : TimeValue;
    createdBy : Principal;
    hidden : Bool;
    status : ContentStatus;
    contentType : ?ContentType;
    pros : [Text];
    cons : [Text];
    rating : Nat8;
  };

  public type NewActor = {
    reviews : List.List<Review>;
  };

  public func run(old : OldActor) : NewActor {
    {
      reviews = old.reviews.map<OldReview, Review>(
        func(oldReview) {
          {
            oldReview with
            contentType = switch (oldReview.contentType) {
              case (null) { ?#news };
              case (x) { x };
            };
            pros = [];
            cons = [];
            rating = 0;
          };
        }
      );
    };
  };
};
