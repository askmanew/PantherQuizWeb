(function() {
  'use strict';

  angular
    .module('app.classList')
    .directive('gzClassTable', gzClassTable);

  function gzClassTable() {
    return {
      templateUrl: 'app/classList/directives/classTable.html',
      restrict: 'E',
      controller: ClassTableController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        rooms: '='
      }
    };
  }

  ClassTableController.$inject = ['$location','$rootScope', 'classRoomService','firebaseDataService', '$firebaseObject'];

  function ClassTableController($location,$rootScope, classRoomService,firebaseDataService, $firebaseObject) {
    var vm = this;

    vm.classRoom = classRoomService.getCurrentClass();
    vm.removeClassRoom = removeClassRoom;
    vm.userName = $rootScope.userEmail;
    vm.save = save;
    vm.quizList = quizList;
    vm.editClass = editClass;
    vm.studentList = studentList;
    vm.currentClassId = "";

    vm.getHeader = getHeader;
    vm.getFileName = getFileName;
    vm.getStudsArray =getStudsArray;
    vm.getQuizScore =getQuizScore;
    vm.gradeReport = gradeReport;

    vm.classRoom =classRoomService.getCurrentClass();
    //this will save the edited classroom from classEdit.html(if redirected from classedit.html)
    if(vm.classRoom){
      vm.rooms.$save(vm.classRoom);
    }

    function removeClassRoom(classRoom) {
      if(confirm("Are you sure you want to delete class " + classRoom.name + " permanently?")){

             vm.rooms.$remove(classRoom);
             classRoomService.showSimpleToast("Class " + classRoom.name + " has been deleted permanently.");
               
      }
    }




    async function gradeReport(classRoom){
      var grades = new Array();
      try {
     
        const studs = await getStudsArray(classRoom);
        console.log(await studs);
        var rows = 0;
        var index ;
        var tempHeader ;

        for(var i = 0; i < studs.length; i++){
          const temp = await getQuizScore(classRoom, studs[i]);
          console.log(await temp);
          grades.push(temp);
          

        }
        
        }
      catch (err) {
        console.log('Network Error', err);
       }
      
       return grades;
      }
   
    // var header = ['quiz1', 'quiz2'];
    
     function getHeader(classRoom){
         var headers = new Array();

        var classRef = firebaseDataService.root.child("quizzes").child(classRoom.$id);
        headers.push('email');
         classRef.once('value').then(function(snapshot){

              snapshot.forEach(function(childSnapshot){
              headers.push(childSnapshot.child('quizId').val());
           
          });//End of forEach()
              
          return headers;  
        });

        return headers;

      }


   //Get quiz score for the give email(student)
  function getQuizScore(classRoom, email){
        var classRef = firebaseDataService.root.child("studentsQuiz").child(classRoom.$id);
        var  quizRef = classRef.child(email);
        var studGrade = new Array();
        var quizObj = {};

        quizObj['email'] = email;
        var counter = 0;

     return quizRef.once('value').then(function(snapshot){
         snapshot.forEach(function(childSnapshot){
          var quizId = childSnapshot.child('quizId').val();
          var score = childSnapshot.child('score').val();
           quizObj[quizId] = score;

          studGrade.push(childSnapshot.getKey());
          counter++;

         });
       console.log("counter:", counter);
         return quizObj;  //Return quiz scores object
         });

      } //End of getQuizScore()


    //Return the list of emails(students) under the given classRoom
   function getStudsArray(classRoom){
    var classRef = firebaseDataService.root.child("studentsQuiz").child(classRoom.$id);
    var arr = new Array();
    return classRef.once('value').then(function(snapshot){

      snapshot.forEach(function(snap){
        arr.push(snap.getKey()); 
      });//End of forEach()
  
      return arr;  //Finally return the result
    });
   }//End of getStudentsArray
   

    function getFileName(classRoom){
      var fileName = "GradeReport.csv";
      return fileName;
    }

 function save(classRoom){  //to be modified with ..
  vm.favorite ='true';
 }
  

   function editClass(classRoom){
    classRoomService.setCurrentClass(classRoom);

    $location.path('/classedit');
   }

    function quizList(classRoom) {
      //set the shared classId/key variable before routing

       classRoomService.setCurrentClass(classRoom);
       $location.path('/quizlist');

    }
    function studentList(classRoom) {
      //set the shared classId/key variable before routing
       classRoomService.setCurrentClass(classRoom);

    
       $location.path('/studentlist');

    }

  }

})();