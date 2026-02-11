import List "mo:core/List";
import Map "mo:core/Map";
import Nat8 "mo:core/Nat8";
import Principal "mo:core/Principal";

module {
  type OldRegion = {
    #asia;
    #europe;
    #usa;
    #middleEast;
  };

  type OldBike = {
    id : Nat;
    name : Text;
    brand : Text;
    specs : Text;
    region : OldRegion;
    createdBy : Principal;
  };

  type OldActor = {
    bikes : List.List<OldBike>;
    // Other old state fields that remain unchanged.
  };

  type NewPriceRange = {
    min : Nat;
    max : Nat;
  };

  type NewBike = {
    id : Nat;
    name : Text;
    brand : Text;
    specs : Text;
    priceRange : NewPriceRange;
    images : [Text];
    details : Text;
    region : OldRegion;
    createdBy : Principal;
  };

  type NewActor = {
    bikes : List.List<NewBike>;
    // Other new state fields.
  };

  public func run(old : OldActor) : NewActor {
    let newBikes = old.bikes.map<OldBike, NewBike>(
      func(oldBike) {
        {
          oldBike with
          priceRange = {
            min = 0; // Default value, can be updated later
            max = 0; // Default value, can be updated later
          };
          images = []; // Default value, empty array
          details = ""; // Default value, empty string
        };
      }
    );
    { bikes = newBikes };
  };
};
