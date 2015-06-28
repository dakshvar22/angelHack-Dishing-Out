var app = angular.module('myApp', ['ngCookies']);
function initialize(b)
{
console.log(b);
var myCenter=new google.maps.LatLng(12.983153,80.245284);
var mapProp = {
  center:myCenter,
  zoom:12,
  mapTypeId:google.maps.MapTypeId.ROADMAP
  
  };

var map=new google.maps.Map(document.getElementById("googleMap"),mapProp);
var marker = new google.maps.Marker({
	  position:myCenter,
	  map:map,
	  title:'Place'
	  });
	  marker.setMap(map);
//var markers = [[12.98573,80.245607],[12.9860305556,80.2459416667],[12.9860527778,80.2460111111],[12.985945,80.246544]];
for(var i =0;i<b.length;i++)
{
	var current = b[i];
	console.log("curent");
	console.log(current);
	console.log(current.latitude);
	
	var marker=new google.maps.Marker({
	  position:new google.maps.LatLng(parseFloat(current["latitude"]),parseFloat(current["longitude"]))
	  //position:new google.maps.LatLng(current[0],current[1])
	  });

	marker.setMap(map);

	var infowindow = new google.maps.InfoWindow({
	  content:current["name"]
	  });

	infowindow.open(map,marker);
	}
}
app.service('currentUser', function(){
	this.userDetails="";
	return{
		addUser:function(newObj){
			this.userDetails = newObj;
		},
		getUser:function(){
			return this.userDetails;
		},
	};
	/*return {
		addUser:addUser,
		getUser:getUser,
	};*/
});
app.controller('MainCtrl', function($scope,$http,$window,currentUser,$cookieStore) {
  $scope.name = 'World';
  //currentUser.addUser("hello");
  //console.log(currentUser.getUser());
  $scope.func = currentUser;
  $scope.submit=function()
  {
     $http({url:'/login',method:"GET",params:{email:$scope.username,pwd:$scope.password}}).success(function(response){
		 console.log(response);
		 $scope.credentials = response.user;
		 //console.log($scope.credentials[0]['EmailId']);
		 if($scope.credentials.length == 0)
		 {
			 alert("Invalid Login");
		 }
		 else if($scope.username == $scope.credentials[0]['EmailId'] && $scope.password == $scope.credentials[0]['Password'])
		 {
			var user=$scope.username;
			var pass=$scope.password;
			//$scope.func.addUser($scope.credentials[0]);
			$cookieStore.put('user',$scope.credentials[0]);
			$cookieStore.put('name',$scope.credentials[0]['Name']);
			//console.log($scope.func.getUser());
			//alert("welcome "+user);
			//$scope.myusers.push({username:user,password:pass});
			//$http({url:'/dashboard',method:"Get"}).success();
			$window.location.href = '/dashboard';
		 }
	});
		 
	 //console.log($scope.credentials);
     
  }
});
app.controller('DashboardCtrl', function($scope,$http,$window,currentUser, $cookies, $cookieStore) {
  //$scope.name = 'World';
  //$scope.credentials = currentUser.getUser();
  //console.log($scope.credentials);
  $scope.name = $cookieStore.get('name');
  $scope.list = ['Nearby','Avadi','Arumbakham','Ambattur']
  //$scope.showDetails=false;
    console.log('came herer');
     /*if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
        console.log("Geolocation is not supported by this browser.");
    }

             $scope.latitude = position.coords.latitude; 
             $scope.longitude = position.coords.longitude;
      */
    $scope.search = function()
    {
    	console.log($scope.dish);
        $http({
         url: '/getRestaurantsByDish',
         method: "GET",
         params: {
             dish: $scope.dish,
             local: $scope.locality
             
         }
     }).success(function (response) {
             var a = [],b=[];
             var temp = response.restaurants;
             console.log(temp);
             for (var i = 0; i < temp.length; i++) {
                 a.push(temp[i]["name"]);
                 b.push({"name":temp[i]["name"],"latitude":temp[i]["location"]["latitude"],"longitude":temp[i]["location"]["longitude"]});
             }
             $scope.restaurants = a;
             $scope.dishName=$scope.dish;
            console.log($scope.restaurants);

			google.maps.event.addDomListener(window, 'load', initialize(b));
			if(temp.length == 0)
			{
				swal("Damnit! No restaurants found", "Why don't you start serving "+$scope.dish+"? ;)")
			}
        });
    
    }
    $scope.searchRestaurant = function(eatery)
    {
    	//$scope.showDetails = ! $scope.showDetails;
    	console.log(eatery);
    	//$scope.clickCheck = true;
    	$http({
         url: '/getRestaurantByName',
         method: "GET",
         params: {
        name: eatery
         }
     }).success(function (response) {
             var a = [];
          console.log(response);
             var restaurant = response.restaurant[0];

          $scope.cuisine = restaurant.cuisine;
          console.log($scope.cuisine);  
          $scope.menu = [];
          $scope.menu = restaurant.menu;
          $scope.city = restaurant["location"]["city"];
          $scope.local = restaurant["location"]["locality"];
          $scope.address = restaurant["location"]["address"];
            console.log(response.restaurant);
    });
    
    //$http({url:
  
	}
});

