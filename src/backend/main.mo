import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat8 "mo:core/Nat8";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
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
  };

  public type Article = {
    id : Nat;
    title : Text;
    content : Text;
    author : Text;
    category : Category;
    region : Region;
    createdAt : TimeValue;
    createdBy : Principal;
    hidden : Bool;
    status : ContentStatus;
  };

  public type Bike = {
    id : Nat;
    name : Text;
    brand : Text;
    specs : Text;
    priceRange : PriceRange;
    images : [Text];
    details : Text;
    region : Region;
    createdBy : Principal;
  };

  public type Comment = {
    id : Nat;
    reviewId : Nat;
    content : Text;
    author : Principal;
    createdAt : TimeValue;
    hidden : Bool;
  };

  public type Rating = {
    reviewId : Nat;
    user : Principal;
    rating : Nat8;
    createdAt : TimeValue;
  };

  public type UserProfile = {
    name : Text;
    bio : Text;
  };

  module NatPrincipalTuple {
    public func compare(tuple1 : (Nat, Principal), tuple2 : (Nat, Principal)) : Order.Order {
      switch (Nat.compare(tuple1.0, tuple2.0)) {
        case (#equal) { Principal.compare(tuple1.1, tuple2.1) };
        case (order) { order };
      };
    };
  };

  var nextReviewId = 0;
  var nextArticleId = 0;
  var nextBikeId = 0;
  var nextCommentId = 0;

  var reviews = List.empty<Review>();
  var articles = List.empty<Article>();
  var bikes = List.empty<Bike>();
  var comments = List.empty<Comment>();
  let ratings = Map.empty<(Nat, Principal), Rating>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public shared ({ caller }) func seedPopularBikeEntries() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed popular bike entries");
    };

    let popularBikes = [
      {
        id = nextBikeId;
        name = "Yamaha YZF-R1";
        brand = "Yamaha";
        specs = "998cc, 200hp, 199kg";
        priceRange = { min = 17399; max = 18000 };
        images = [
          "https://example.com/yamaha1.jpg",
          "https://example.com/yamaha2.jpg",
        ];
        details = "Superbike with advanced electronics and lightweight frame";
        region = #asia;
        createdBy = Principal.fromText("qa6aq-aaaaa-aaaam-qbrla-cai");
      },
      {
        id = nextBikeId + 1;
        name = "Honda CBR1000RR";
        brand = "Honda";
        specs = "999cc, 189hp, 196kg";
        priceRange = { min = 16000; max = 17500 };
        images = [
          "https://example.com/honda1.jpg",
          "https://example.com/honda2.jpg",
        ];
        details = "Track-focused superbike with reliability and performance";
        region = #asia;
        createdBy = Principal.fromText("qa6aq-aaaaa-aaaam-qbrla-cai");
      },
      {
        id = nextBikeId + 2;
        name = "Suzuki Hayabusa";
        brand = "Suzuki";
        specs = "1340cc, 187hp, 264kg";
        priceRange = { min = 15999; max = 17000 };
        images = [
          "https://example.com/hayabusa1.jpg",
          "https://example.com/hayabusa2.jpg",
        ];
        details = "Hyperbike known for top speed and grand touring comfort";
        region = #asia;
        createdBy = Principal.fromText("qa6aq-aaaaa-aaaam-qbrla-cai");
      },
      {
        id = nextBikeId + 3;
        name = "BMW S1000RR";
        brand = "BMW";
        specs = "999cc, 205hp, 197kg";
        priceRange = { min = 19995; max = 23000 };
        images = [
          "https://example.com/bmw1.jpg",
          "https://example.com/bmw2.jpg",
        ];
        details = "High-performance superbike with state-of-the-art electronics";
        region = #europe;
        createdBy = Principal.fromText("qa6aq-aaaaa-aaaam-qbrla-cai");
      },
      {
        id = nextBikeId + 4;
        name = "Kawasaki Ninja ZX-10R";
        brand = "Kawasaki";
        specs = "998cc, 203hp, 207kg";
        priceRange = { min = 16499; max = 17000 };
        images = [
          "https://example.com/kawasaki1.jpg",
          "https://example.com/kawasaki2.jpg",
        ];
        details = "World Superbike championship-winning technology";
        region = #asia;
        createdBy = Principal.fromText("qa6aq-aaaaa-aaaam-qbrla-cai");
      },
      {
        id = nextBikeId + 5;
        name = "BMW S1000RR";
        brand = "BMW";
        specs = "999cc, 205hp, 197kg";
        priceRange = { min = 19995; max = 23000 };
        images = [
          "https://example.com/bmw1.jpg",
          "https://example.com/bmw2.jpg",
        ];
        details = "High-performance superbike with state-of-the-art electronics";
        region = #europe;
        createdBy = Principal.fromText("qa6aq-aaaaa-aaaam-qbrla-cai");
      },
      {
        id = nextBikeId + 6;
        name = "Triumph Speed Triple 1200 RS";
        brand = "Triumph";
        specs = "1160cc, 177hp, 198kg";
        priceRange = { min = 17995; max = 20000 };
        images = [
          "https://example.com/triumph1.jpg",
          "https://example.com/triumph2.jpg",
        ];
        details = "Naked sportbike with strong performance and comfort";
        region = #europe;
        createdBy = Principal.fromText("qa6aq-aaaaa-aaaam-qbrla-cai");
      },
      {
        id = nextBikeId + 7;
        name = "Ducati Panigale V4";
        brand = "Ducati";
        specs = "1103cc, 214hp, 198kg";
        priceRange = { min = 21995; max = 30000 };
        images = [
          "https://example.com/ducati1.jpg",
          "https://example.com/ducati2.jpg",
        ];
        details = "Italian superbike combining performance and style";
        region = #europe;
        createdBy = Principal.fromText("qa6aq-aaaaa-aaaam-qbrla-cai");
      },
    ];

    bikes.addAll(popularBikes.values());
    nextBikeId += 8;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createOrSaveArticle(
    title : Text,
    content : Text,
    author : Text,
    category : Category,
    region : Region,
    status : ContentStatus,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create or save articles");
    };
    let article : Article = {
      id = nextArticleId;
      title;
      content;
      author;
      category;
      region;
      createdAt = Time.now();
      createdBy = caller;
      hidden = false;
      status;
    };
    articles.add(article);
    nextArticleId += 1;
    article.id;
  };

  public shared ({ caller }) func publishArticle(articleId : Nat) : async () {
    let articlesArray = articles.toArray();
    let articleOpt = articlesArray.find(func(a : Article) : Bool { a.id == articleId });

    switch (articleOpt) {
      case (null) { Runtime.trap("Article not found") };
      case (?article) {
        if (article.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can publish this article");
        };
        articles := articles.map<Article, Article>(
          func(a : Article) : Article {
            if (a.id == articleId) {
              {
                id = a.id;
                title = a.title;
                content = a.content;
                author = a.author;
                category = a.category;
                region = a.region;
                createdAt = a.createdAt;
                createdBy = a.createdBy;
                hidden = a.hidden;
                status = #published;
              };
            } else {
              a;
            };
          }
        );
      };
    };
  };

  public shared ({ caller }) func hideArticle(articleId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can hide articles");
    };
    articles := articles.map<Article, Article>(
      func(a : Article) : Article {
        if (a.id == articleId) {
          {
            id = a.id;
            title = a.title;
            content = a.content;
            author = a.author;
            category = a.category;
            region = a.region;
            createdAt = a.createdAt;
            createdBy = a.createdBy;
            hidden = true;
            status = a.status;
          };
        } else {
          a;
        };
      }
    );
  };

  public shared ({ caller }) func deleteArticle(articleId : Nat) : async () {
    let articlesArray = articles.toArray();
    let articleOpt = articlesArray.find(func(a : Article) : Bool { a.id == articleId });

    switch (articleOpt) {
      case (null) { Runtime.trap("Article not found") };
      case (?article) {
        if (article.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can delete this article");
        };
        articles := articles.filter<Article>(func(a : Article) : Bool { a.id != articleId });
      };
    };
  };

  public shared ({ caller }) func createOrSaveReview(
    title : Text,
    content : Text,
    author : Text,
    score : Score,
    bikeId : Nat,
    region : Region,
    status : ContentStatus,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create or save reviews");
    };
    let review : Review = {
      id = nextReviewId;
      title;
      content;
      author;
      score;
      bikeId;
      region;
      createdAt = Time.now();
      createdBy = caller;
      hidden = false;
      status;
    };
    reviews.add(review);
    nextReviewId += 1;
    review.id;
  };

  public shared ({ caller }) func publishReview(reviewId : Nat) : async () {
    let reviewsArray = reviews.toArray();
    let reviewOpt = reviewsArray.find(func(r : Review) : Bool { r.id == reviewId });

    switch (reviewOpt) {
      case (null) { Runtime.trap("Review not found") };
      case (?review) {
        if (review.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can publish this review");
        };
        reviews := reviews.map<Review, Review>(
          func(r : Review) : Review {
            if (r.id == reviewId) {
              {
                id = r.id;
                title = r.title;
                content = r.content;
                author = r.author;
                score = r.score;
                bikeId = r.bikeId;
                region = r.region;
                createdAt = r.createdAt;
                createdBy = r.createdBy;
                hidden = r.hidden;
                status = #published;
              };
            } else {
              r;
            };
          }
        );
      };
    };
  };

  public shared ({ caller }) func hideReview(reviewId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can hide reviews");
    };
    reviews := reviews.map<Review, Review>(
      func(r : Review) : Review {
        if (r.id == reviewId) {
          {
            id = r.id;
            title = r.title;
            content = r.content;
            author = r.author;
            score = r.score;
            bikeId = r.bikeId;
            region = r.region;
            createdAt = r.createdAt;
            createdBy = r.createdBy;
            hidden = true;
            status = r.status;
          };
        } else {
          r;
        };
      }
    );
  };

  public shared ({ caller }) func deleteReview(reviewId : Nat) : async () {
    let reviewsArray = reviews.toArray();
    let reviewOpt = reviewsArray.find(func(r : Review) : Bool { r.id == reviewId });

    switch (reviewOpt) {
      case (null) { Runtime.trap("Review not found") };
      case (?review) {
        if (review.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can delete this review");
        };
        reviews := reviews.filter<Review>(func(r : Review) : Bool { r.id != reviewId });
      };
    };
  };

  public shared ({ caller }) func createBike(
    name : Text,
    brand : Text,
    specs : Text,
    priceRange : PriceRange,
    images : [Text],
    details : Text,
    region : Region,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bikes");
    };
    let bike : Bike = {
      id = nextBikeId;
      name;
      brand;
      specs;
      priceRange;
      images;
      details;
      region;
      createdBy = caller;
    };
    bikes.add(bike);
    nextBikeId += 1;
    bike.id;
  };

  public shared ({ caller }) func editBike(
    bikeId : Nat,
    name : Text,
    brand : Text,
    specs : Text,
    priceRange : PriceRange,
    images : [Text],
    details : Text,
    region : Region,
  ) : async () {
    let bikesArray = bikes.toArray();
    let bikeOpt = bikesArray.find(func(b : Bike) : Bool { b.id == bikeId });

    switch (bikeOpt) {
      case (null) { Runtime.trap("Bike not found") };
      case (?bike) {
        if (bike.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can edit this bike");
        };
        bikes := bikes.map<Bike, Bike>(
          func(b : Bike) : Bike {
            if (b.id == bikeId) {
              {
                id = b.id;
                name;
                brand;
                specs;
                priceRange;
                images;
                details;
                region;
                createdBy = b.createdBy;
              };
            } else {
              b;
            };
          }
        );
      };
    };
  };

  public shared ({ caller }) func deleteBike(bikeId : Nat) : async () {
    let bikesArray = bikes.toArray();
    let bikeOpt = bikesArray.find(func(b : Bike) : Bool { b.id == bikeId });

    switch (bikeOpt) {
      case (null) { Runtime.trap("Bike not found") };
      case (?bike) {
        if (bike.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the creator or admin can delete this bike");
        };
        bikes := bikes.filter<Bike>(func(b : Bike) : Bool { b.id != bikeId });
      };
    };
  };

  public shared ({ caller }) func createComment(reviewId : Nat, content : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create comments");
    };
    let comment : Comment = {
      id = nextCommentId;
      reviewId;
      content;
      author = caller;
      createdAt = Time.now();
      hidden = false;
    };
    comments.add(comment);
    nextCommentId += 1;
    comment.id;
  };

  public shared ({ caller }) func hideComment(commentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can hide comments");
    };
    comments := comments.map<Comment, Comment>(
      func(c : Comment) : Comment {
        if (c.id == commentId) {
          {
            id = c.id;
            reviewId = c.reviewId;
            content = c.content;
            author = c.author;
            createdAt = c.createdAt;
            hidden = true;
          };
        } else {
          c;
        };
      }
    );
  };

  public shared ({ caller }) func deleteComment(commentId : Nat) : async () {
    let commentsArray = comments.toArray();
    let commentOpt = commentsArray.find(func(c : Comment) : Bool { c.id == commentId });

    switch (commentOpt) {
      case (null) { Runtime.trap("Comment not found") };
      case (?comment) {
        if (comment.author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the author or admin can delete this comment");
        };
        comments := comments.filter<Comment>(func(c : Comment) : Bool { c.id != commentId });
      };
    };
  };

  public query func getCommentsByReview(reviewId : Nat) : async [Comment] {
    let commentsArray = comments.toArray();
    commentsArray.filter<Comment>(func(c : Comment) : Bool { c.reviewId == reviewId and not c.hidden });
  };

  public shared ({ caller }) func rateReview(reviewId : Nat, rating : Nat8) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can rate reviews");
    };
    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };
    let ratingRecord : Rating = {
      reviewId;
      user = caller;
      rating;
      createdAt = Time.now();
    };
    ratings.add((reviewId, caller), ratingRecord);
  };

  public query func getReviewRatings(reviewId : Nat) : async [Rating] {
    let ratingsArray = ratings.entries().toArray();
    let ratingsFromArray = ratingsArray.filter(
      func(entry : ((Nat, Principal), Rating)) : Bool {
        let ((rId, _), _) = entry;
        rId == reviewId;
      }
    );
    ratingsFromArray.map(
      func(entry) {
        let ((_, _), rating) = entry;
        rating;
      }
    );
  };

  public query ({ caller }) func getMyDraftArticles() : async [Article] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their drafts");
    };
    let myDrafts = articles.filter(func(a) { a.createdBy == caller and a.status == #draft });
    myDrafts.toArray();
  };

  public query ({ caller }) func getMyDraftReviews() : async [Review] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their drafts");
    };
    let myDrafts = reviews.filter(func(r) { r.createdBy == caller and r.status == #draft });
    myDrafts.toArray();
  };

  public query func getAllPublishedArticles() : async [Article] {
    let articlesArray = articles.toArray();
    articlesArray.filter<Article>(
      func(a : Article) : Bool { not a.hidden and a.status == #published }
    );
  };

  public query func getAllPublishedReviews() : async [Review] {
    let reviewsArray = reviews.toArray();
    reviewsArray.filter<Review>(
      func(r : Review) : Bool { not r.hidden and r.status == #published }
    );
  };

  public query func getAllBikes() : async [Bike] {
    bikes.toArray();
  };

  public query func getBikeById(bikeId : Nat) : async ?Bike {
    bikes.toArray().find(func(bike) { bike.id == bikeId });
  };

  public query ({ caller }) func getUserBikes() : async [Bike] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their bikes");
    };
    bikes.toArray().filter(
      func(bike) { bike.createdBy == caller }
    );
  };
};
