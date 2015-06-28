var app = angular.module('myApp', []);

app.controller('MainCtrl', function($scope,$http,$window) {
  $scope.name = 'World';
  
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
			alert("welcome "+user);
            
             
			//$scope.myusers.push({username:user,password:pass});
			//$http({url:'/dashboard',method:"Get"}).success();
             
             
			//$window.location.href = '/';
		 }
	});
		 
	 //console.log($scope.credentials);
     
  }
  
  
  $scope.search=function()
  {
      
    
      
      $http(url:'/
  
  }
});
