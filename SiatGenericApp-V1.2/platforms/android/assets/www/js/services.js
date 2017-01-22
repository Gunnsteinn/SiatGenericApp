angular.module('app.services', [])

.factory('localstorageFactory', ['$window', function ($window) {
    return {
        setlogUser: function (logUser) {
            $window.localStorage['logUser'] = JSON.stringify(logUser);
        },
        getlogUser: function () {
            if (typeof ($window.localStorage['logUser']) === 'undefined') {
                return 'undefined';
            } else {
                return JSON.parse($window.localStorage['logUser']);
            } 
        },
        setIdUser: function (idUsuario) {
            $window.localStorage['idUsuario'] = JSON.stringify(idUsuario); 
        },
        getIdUser: function () {
            return JSON.parse($window.localStorage['idUsuario']);
        },
        setUsersRef: function (usersRef) {
            $window.localStorage['usersRef'] = JSON.stringify(usersRef);
        },
        getUsersRef: function () {
            return JSON.parse($window.localStorage['usersRef'] || '{}');
        },
        setPatientData: function (patientData) {
            $window.localStorage['patientData'] = JSON.stringify(patientData);
        },
        getPatientData: function () {
            return JSON.parse($window.localStorage['patientData'] || '{}');
        },
        remove: function () {
            $window.localStorage.removeItem('logUser');
            $window.localStorage.removeItem('usersRef');
            $window.localStorage.removeItem('idUsuario');
            $window.localStorage.removeItem('patientData');
        }
    }
}])

.service('LoginMedicService', ['$http', function ($http) {
    console.log("LoginService");
    return {
        loginUser: function (name, pw) {
            var info = "usuario=" + name + "&contrasenia=" + pw;
            console.log(info);
            return $http({
                        url: "http://www.e-siat.net/siat_webservice_test/index.php/logIn/inicioEspecialista",
                        method: "POST",
                        data: info,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    })
                    .success(function (data) {
                        console.log('data: ' + data[0]);
                        return data[0];
                    });
        }
    }
}])

.service('LoginPatientService', ['$http', function ($http) {
    return {
        loginUser: function (name, pw) {
            var info = "usuario=" + name + "&contrasenia=" + pw;
            console.log("info patient: " + info);
            return $http({
                        url: "http://www.e-siat.net/siat_webservice_test/index.php/logIn/inicio",
                        method: "POST",
                        data: info,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    })
                    .success(function (data) {
                        console.log('data: ' + data);
                        return data;
                    });
        }
    }
}])

.service('msjService', ['$http', function ($http) {
    return {
        msjUser: function (idUsuario) {
            var info = "id=" + idUsuario + "&since=0";
            console.log(info);
            return $http({
                        url: "http://www.e-siat.net/siat_webservice_test/index.php/mensajes/getMessages",
                        method: "POST",
                        data: info,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    })
                    .success(function (data) {
                        console.log('data: ' + data[0]);
                        return data[0];
                    });
        }
    }
}]);