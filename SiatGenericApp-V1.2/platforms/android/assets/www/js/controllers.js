angular.module('app.controllers', [])
  
.controller('inicioCtrl', ['$scope', '$timeout', 'localstorageFactory', '$state', function ($scope, $timeout, localstorageFactory, $state) {
    $timeout(function () {
        if (localstorageFactory.getlogUser() !== 'undefined') {
            console.log("$state: " + localstorageFactory.getlogUser().type);
            if (localstorageFactory.getlogUser().type === 'medic') {
                $state.go('pacientes');
            } else {
                $state.go('pacienteMenu');
            }
        } else {
            $state.go('seleccioneUsuario');
        }
    }, 500);
}])
   
.controller('seleccioneUsuarioCtrl', ['$scope', 'localstorageFactory', '$state',  function ($scope, localstorageFactory, $state) {  
}])
   
.controller('loginPacienteCtrl', ['$scope', '$http', '$state', 'localstorageFactory', 'LoginPatientService', '$ionicPopup', function ($scope, $http, $state, localstorageFactory, LoginPatientService, $ionicPopup) {
    //----------------------------------- Variables ------------------------------------------
    $scope.data = {};
    

    //----------------------------------- Functions ------------------------------------------
    $scope.loginPatient = function () {
        console.log('pass ' + $scope.data.usernamePatient + $scope.data.passwordPatient);
        LoginPatientService.loginUser($scope.data.usernamePatient, $scope.data.passwordPatient)
            .success(function (data) {
                if (typeof data !== 'string' && data[0] !== null && data[0] !== "") {
                    $state.go('pacienteMenu');
                    $scope.data.type = "patient";
                    data.push({ localstorageDataPacientActive: false });
                    localstorageFactory.setlogUser($scope.data);
                    localstorageFactory.setPatientData(data);
                    $scope.errorLoginPatient = false;
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Login Error!',
                        template: 'Usuario o Contraseña Incorrectos!'
                    });
                }
            })
            .error(function (data) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Login Error!',
                    template: 'Usuario o Contraseña Incorrectos!'
                });
            });
    }
}])
   
.controller('loginEspecialistaCtrl', ['$scope', '$http', '$state', 'localstorageFactory', 'LoginMedicService', '$ionicPopup', function ($scope, $http, $state, localstorageFactory, LoginMedicService, $ionicPopup) {
    //----------------------------------- Variables ------------------------------------------
    $scope.data = {};
    $scope.errorLoginMedic = false;

    //----------------------------------- Functions ------------------------------------------
    $scope.loginMedic = function () {
        console.log('pass ' + $scope.data.usernameMedic + $scope.data.passwordMedic);
        LoginMedicService.loginUser($scope.data.usernameMedic, $scope.data.passwordMedic)
            .success(function (data) {
                if (typeof (data[0]) !== 'undefined' && data[0] !== null) {
                    $state.go('pacientes');
                    $scope.data.type = "medic";
                    localstorageFactory.setlogUser($scope.data);
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Login Error!',
                        template: 'Usuario o Contraseña Incorrectos!'
                    });
                }     
            })
            .error(function (data) {
                var alertPopup = $ionicPopup.alert({
                    title: 'Login Error!',
                    template: 'Usuario o Contraseña Incorrectos!'
                });
            });
    }
}])
   
.controller('mensajes', ['$scope', 'msjService', 'localstorageFactory', '$http', '$window','$ionicScrollDelegate', function ($scope, msjService, localstorageFactory, $http, $window, $ionicScrollDelegate) {
    //----------------------------------- Variables ------------------------------------------
    $scope.loading = true;
    var usersId = localstorageFactory.getIdUser();
    $scope.chatResult = [];
    $scope.sendMessage = "";

    //----------------------------------- Functions ------------------------------------------
    msjService.msjUser(usersId.medico)
        .success(function (data) {
            $scope.dataChat = data[0].MESSAGES_object;
            var isMedico, userFoto;
            for (var i = 0; i < $scope.dataChat.length; i++) {
                if($scope.dataChat[i].from === usersId.medico){
                    esMedico = true;
                    userFoto = usersId.medicoFoto;
                }else {
                    esMedico = false;
                    userFoto = usersId.pacienteFoto;
                }
                if (usersId.paciente === $scope.dataChat[i].to || usersId.paciente === $scope.dataChat[i].from) {
                    $scope.chatResult.push({
                        msj: $scope.dataChat[i].mensaje,
                        userFoto: userFoto,
                        esMedico: esMedico
                    });
                }
            }
            $ionicScrollDelegate.scrollBottom();
            $scope.loading = false;
        })
        .error(function (data) {
            var alertPopup = $ionicPopup.alert({
                title: 'Login Error!',
                template: 'Usuario o Contraseña Incorrectos!'
            });
        });

    $scope.isMedicClass = function (esMedico) {
        return esMedico ? 'leftSide.html' : 'rightSide.html';
    };

    $scope.sendMsj = function (sendMessage) {
        var info = "id_from=" + usersId.medico + "&id_to=" + usersId.paciente + "&mensaje=" + sendMessage;

        $http({
            url: "http://www.e-siat.net/siat_webservice_test/index.php/mensajes/setMessage",
            method: "POST",
            data: info,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .success(function (data, status, headers, config) {
            $scope.chatResult.push({
                msj     : sendMessage,
                userFoto: usersId.medicoFoto,
                esMedico: true
            });
            $ionicScrollDelegate.scrollBottom();
        });
        $scope.sendMessage = "";
        $scope.$apply;
    }
}])
   
.controller('pacientesCtrl', ['$scope', '$http', 'localstorageFactory', '$state', '$window', function ($scope, $http, localstorageFactory, $state, $window) {
    //----------------------------------- Variables ------------------------------------------
    $scope.loading = true;
    $scope.usersRef = [];
    $scope.activeUser = localstorageFactory.getlogUser();
    var info = "usuario=" + $scope.activeUser.usernameMedic + "&contrasenia=" + $scope.activeUser.passwordMedic;

    //--------------------------------- XMLHttpRequest ---------------------------------------
    $http({
        url: "http://www.e-siat.net/siat_webservice_test/index.php/logIn/inicioEspecialista",
        method: "POST",
        data: info,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .success(function (data, status, headers, config) {
        $scope.idUsuario = data[0].idUsuario;
        var info = "idEspecialista=" + data[0].idEspecialista;
        $http({
            url: "http://www.e-siat.net/siat_webservice_test/index.php/logIn/getPacientes",
            method: "POST",
            data: info,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .success(function (data, status, headers, config) {
            console.log("hola" + data[0].pacientes);
            $scope.loading = false;
            $scope.result = data[0].pacientes;
            var j = 0, x = 0;
            for (var i = 0; i < $scope.result.length; i++) {
                console.log($scope.result[i].idUsuario);
                var info = "idPaciente=" + $scope.result[i].idPaciente;
                $http({
                    url: "http://www.e-siat.net/siat_webservice_test/index.php/logIn/getTratamiento",
                    method: "POST",
                    data: info,
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                })
                .success(function (data, status, headers, config) {
                    $scope.result[j].comercial = data[0].comercial;
                    console.log("result: " + j + $scope.result[j].comercial);
                    var info = "idUsuario=" + $scope.result[j].idPaciente;
                    $http({
                        url: "http://www.e-siat.net/siat_webservice_test/index.php/logIn/getPacienteInfo",
                        method: "POST",
                        data: info,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    })
                    .success(function (data, status, headers, config) {
                        $scope.result[x].imagen_perfil = "http://e-siat.net/siat/profilepicture/" + data[0].imagen_perfil;
                        console.log("imagen_perfil: " + $scope.result[x].imagen_perfil);
                                        
                        $scope.usersRef.push({
                            name        : $scope.result[x].nombre,
                            lastName    : $scope.result[x].apellido,
                            userFoto    : $scope.result[x].imagen_perfil,
                            idUsuario   : $scope.result[x].idUsuario,
                            idPaciente  : $scope.result[x].idPaciente
                            });
                        x++;
                    });
                    j++;
                });
            }
        });
    });

    //----------------------------------- Functions ------------------------------------------
    $scope.itemClick = function (index , idUsuarioPaciente) {
        var pacienteFoto = $scope.result[index].imagen_perfil;
        var idUsuario = {
                            paciente    : idUsuarioPaciente,
                            pacienteFoto: pacienteFoto,
                            medico      : $scope.idUsuario,
                            medicoFoto  : "http://image.flaticon.com/icons/svg/204/204225.svg"
                        };
        localstorageFactory.setIdUser(idUsuario);
    }

    $scope.turnos = function () {
        localstorageFactory.setUsersRef($scope.usersRef);
    }

    $scope.logOut = function () {
        localstorageFactory.remove();
        $state.go('inicio', {}, { reload: true });
        $window.location.reload(true);
    }

}])
   
.controller('turnosCtrl', ['$scope', '$http', 'localstorageFactory','$filter', function ($scope, $http, localstorageFactory, $filter) {
    //----------------------------------- Variables ------------------------------------------
    $scope.turnosInfo = localstorageFactory.getUsersRef();
    $scope.turnosInfoSem = [];
    $scope.turnosInfoProx = [];
    var j = 0, p = 0, x = 0;

    //--------------------------------- XMLHttpRequest ---------------------------------------
    for (var i = 0; i < $scope.turnosInfo.length; i++) {
        var info = "idUsuario=" + $scope.turnosInfo[i].idUsuario;
        $http({
            url: "http://www.e-siat.net/siat_webservice_test/index.php/logIn/update",
            method: "POST",
            data: info,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .success(function (data, status, headers, config) {
            d = new Date(data[8].hora);
            var day = d.getDay();

            var aux = data[8].hora;
            var divdaux = aux.split(" ");
            var divd1 = divdaux[0].split("-");
            var today1 = (divd1[1] + '/' + divd1[2] + '/' + divd1[0]).toString();

            var today = new Date();
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();

            if (dd < 10) {
                dd = '0' + dd
            }

            if (mm < 10) {
                mm = '0' + mm
            }
            var onejan = new Date(today.getFullYear(), 0, 1);
            var nbrOfDay = Math.ceil((((today - onejan) / 86400000) + onejan.getDay() + 1) / 7);

            var date1 = new Date((mm + '/' + dd + '/' + yyyy).toString());
            var date2 = new Date(today1);
            diffDate = date2.getTime() - date1.getTime() + (86400000 * (nbrOfDay - 1));


            
            console.log(diffDate);
            if (date2.getTime() - date1.getTime() >= 0) {
                if (diffDate < 518400000) {
                    $scope.turnosInfoSem.push($scope.turnosInfo[x]);
                    $scope.turnosInfoSem[j].turno = data[8].hora;
                    j++;
                } else {
                    $scope.turnosInfoProx.push($scope.turnosInfo[x]);
                    $scope.turnosInfoProx[p].turno = data[8].hora;
                    p++;
                }
            }
            x++;
        });
    }

}])
 
.controller('pacienteMenuCtrl', ['$scope', '$http', 'localstorageFactory', '$state', '$window', '$ionicPopup', '$timeout', '$ionicPlatform', '$cordovaLocalNotification',
    function ($scope, $http, localstorageFactory, $state, $window, $ionicPopup, $timeout, $ionicPlatform, $cordovaLocalNotification) {
    //----------------------------------- Variables ------------------------------------------
    $scope.loading = true;
    var aux = localstorageFactory.getPatientData();
    var info = "idUsuario=" + aux[2].idPaciente;
    $scope.data = aux;

    if ($scope.data[11].localstorageDataPacientActive) {
        $scope.imagen_perfil = $scope.data[12].imagen_perfil;
        $scope.dosis = $scope.data[6].dosis;
        $scope.patientInfo = {
            espName: $scope.data[5].nombre,
            espLastName: $scope.data[5].apellido,
            espPhoto: "http://image.flaticon.com/icons/svg/204/204225.svg",
            espturn: dateConvert($scope.data[8].hora.split(" ")),
            espTel: "tel:+" + $scope.data[5].telefono,
            patName: $scope.data[2].nombre,
            patLastName: $scope.data[2].apellido,
            patPhoto: $scope.imagen_perfil,
            patturn: dateConvert(proxDosis($scope.data[6].dosis).next),
            percentTodosis: $scope.percentTodosis,
            dosisPeriod: $scope.dosisPeriod
        };
        $timeout(function () {
            $scope.loading = false;
        }, 200);
    } else {
        //--------------------------------- XMLHttpRequest ---------------------------------------
        $http({
            url: "http://www.e-siat.net/siat_webservice_test/index.php/logIn/getPacienteInfo",
            method: "POST",
            data: info,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        .success(function (data) {
            $scope.dosis = data[0].dosis;
            $scope.imagen_perfil = "http://e-siat.net/siat/profilepicture/" + data[0].imagen_perfil;
            $scope.patientInfo = {
                espName: aux[5].nombre,
                espLastName: aux[5].apellido,
                espPhoto: "http://image.flaticon.com/icons/svg/204/204225.svg",
                espturn: dateConvert(aux[8].hora.split(" ")),
                espTel: "tel:+" + aux[5].telefono,
                patName: aux[2].nombre,
                patLastName: aux[2].apellido,
                patPhoto: $scope.imagen_perfil,
                patturn: dateConvert(proxDosis($scope.dosis).next),
                percentTodosis: $scope.percentTodosis,
                dosisPeriod: $scope.dosisPeriod
            };
            $timeout(function () {
                $scope.loading = false;
            }, 200);
        });
    }
    

    //----------------------------------- Functions ------------------------------------------
    function dateConvert(auxDate) {
        var auxDate1 = auxDate[0].split("-");
        var date = auxDate1[2] + "/" + auxDate1[1];

        var auxhour1 = auxDate[1].split(":");
        var hour = auxhour1[0] + ":" + auxhour1[1];
        return date + " " + hour
    }

    function proxDosis(auxd) {
        var divd = {};
        var j = -1;
        for (var i = 0; i < auxd.length; i++) {
            if (auxd[i].aplicada == 0) {
                if (j >= 0) {
                    divd.before = auxd[j].fechaHoraPrevisto.split(" ");
                } else {
                    divd.before = auxd[0].fechaHoraPrevisto.split(" ");
                }

                divd.next = auxd[i].fechaHoraPrevisto.split(" ");
                console.log(divd.next + "    " + divd.before);
                var diffProxDosisDate = diffDate(divd.before, divd.next);
                console.log(diffProxDosisDate);
                if (diffProxDosisDate !== -1) {
                    var d = new Date();
                    var d1 = new Date(auxd[i].fechaHoraPrevisto);
                    $scope.percentTodosis = Date.now() / 1000 - $scope.dosisB;
                    $scope.dosisPeriod = $scope.dosisA - $scope.dosisB;
                    $scope.progressBarColor = '#45ccce';

                    var diffMins = (d - d1) / 60000;
                    var segundos = ((d - d1) / -60000) * 60;

                    d = Number(segundos);
                    var h = Math.floor(d / 3600);
                    var m = Math.floor(d % 3600 / 60);
                    var s = Math.floor(d % 3600 % 60);
                 
                    console.log(h + ":" + m + ":" + s);
                    if (diffMins > -60 && diffMins <= 120) {
                        $scope.takeDosis = 'Tomar Dosis';
                        $scope.takeDosisButton = 'button button-positive button-block';
                        $scope.cancelDosisButton = "button button-outline button-assertive icon ion-android-close";
                        $scope.takeDosisStatusButton = true;
                    } else {
                        $scope.takeDosis = 'Faltan ' + (h + ":" + m + ":" + s) + ' para poder tomar su dosis';
                        $scope.takeDosisButton = 'button button-stable button-block';
                        $scope.cancelDosisButton = "button button-outline button-stable icon ion-android-close";
                        $scope.takeDosisStatusButton = false;
                    } 
                    console.log($scope.percentTodosis + "    " + $scope.dosisPeriod);
                    return divd;
                } else {
                    $scope.percentTodosis = 100;
                    $scope.dosisPeriod = 100;
                    $scope.progressBarColor = '#c40505';
                    $scope.takeDosis = 'Tomar Dosis';
                    $scope.takeDosisButton = 'button button-positive button-block';
                    $scope.cancelDosisButton = "button button-outline button-assertive icon ion-android-close";
                    $scope.takeDosisStatusButton = true;
                    return divd;
                }
            }
            j++;
        } 
    }

    function diffDate(dateB, dateN) {
        var divd1 = dateN[0].split("-");
        var today1 = (divd1[1] + '/' + divd1[2] + '/' + divd1[0]).toString();
        var today1a = (divd1[1] + '/' + divd1[2] + '/' + divd1[0] + " " + dateN[1] + ":30").toString();

        var divd2 = dateB[0].split("-");
        var today2 = (divd2[1] + '/' + divd2[2] + '/' + divd2[0]).toString();
        var today2a = (divd2[1] + '/' + divd2[2] + '/' + divd2[0] + " " + dateB[1] + ":30").toString();

        var today = new Date();

        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        var date1 = new Date((mm + '/' + dd + '/' + yyyy).toString());
        var date2 = new Date(today1);

        var datea = new Date(today1a);
        var dateb = new Date(today2a);

        $scope.dosisB = dateb.getTime() / 1000;
        $scope.dosisA = datea.getTime() / 1000;


        if (Date.now() / 1000 <= $scope.dosisA) {
            $scope.proxDosis = Math.abs($scope.dosisA - Date.now() / 1000);
            //console.log($scope.proxDosis / 60);
            var timeDiff = Math.abs($scope.dosisA - Date.now() / 1000);
            return Math.ceil(timeDiff / (1000 * 3600 * 24));
        } else {
            return -1;
        }
    }

    function setDosis(type) {
        var auxSetd = $scope.dosis;
        var auxSetAplicada = {};
        var currentdate = new Date();
        var datetime = currentdate.getFullYear() + "-"
                        + (currentdate.getMonth() + 1) + "-"
                        + currentdate.getDate() + " "
                        + currentdate.getHours() + ":"
                        + currentdate.getMinutes() + ":"
                        + currentdate.getSeconds();

        for (var i = 0; i < auxSetd.length; i++) {
            if (auxSetd[i].aplicada == 0) {
                auxSetAplicada.aplicada = type;
                auxSetAplicada.fechaHoraReal = datetime;
                auxSetAplicada.fechaHoraPrevisto = auxSetd[i].fechaHoraPrevisto;
                auxSetAplicada.idTratamiento = auxSetd[i].idTratamiento;
                auxSetAplicada.idDosis = auxSetd[i].idDosis;
                auxSetd[i].aplicada = type;
                auxSetd[i].fechaHoraReal = datetime;
                break;
            }
        }

        console.log(auxSetAplicada.aplicada + "--->" + auxSetAplicada.fechaHoraReal + "--->" + auxSetAplicada.fechaHoraPrevisto);
        console.log(auxSetAplicada.idTratamiento + "--->" + auxSetAplicada.idDosis);

        //$scope.setDosis = [
        //    {
        //        "activa": 1,
        //        "aplicada": auxSetAplicada.aplicada,
        //        "cantidad": "",
        //        "droga": "0",
        //        "fechaHoraPrevisto": auxSetAplicada.fechaHoraPrevisto,
        //        "fechaHoraReal": auxSetAplicada.fechaHoraReal,
        //        "idDetalleDroga": 0,
        //        "idDosis": auxSetAplicada.idDosis,
        //        "idTratamiento": 182,
        //        "tipo": 1
        //    }];

        $scope.setDosis = [[], [
            {
                "activa": 1,
                "aplicada": auxSetAplicada.aplicada,
                "cantidad": "",
                "droga": "0",
                "fechaHoraPrevisto": auxSetAplicada.fechaHoraPrevisto,
                "fechaHoraReal": auxSetAplicada.fechaHoraReal,
                "idDetalleDroga": 0,
                "idDosis": auxSetAplicada.idDosis,
                "idTratamiento": auxSetAplicada.idTratamiento,
                "tipo": 1
            }], []];

        console.log($scope.setDosis);

        $scope.detalledosis = [];
        $scope.accidente = [];
        $scope.data[6].dosis = auxSetd;
        $scope.data.push({ imagen_perfil: $scope.imagen_perfil });
        $scope.data[11].localstorageDataPacientActive = true;
        localstorageFactory.setPatientData($scope.data);
        return  $scope.setDosis ;
    }

    $scope.logOut = function () {
        localstorageFactory.remove();
        $state.go('inicio', {}, { reload: true });
        $window.location.reload(true);
    }

    $scope.chatInfo = function () {
        console.log("imagen_perfil: " + $scope.imagen_perfil);
        var idUsuario = {
            paciente        : aux[0].idUsuario,
            pacienteFoto    : $scope.imagen_perfil,
            medico          : aux[4].idUsuario,
            medicoFoto      : "http://image.flaticon.com/icons/svg/204/204225.svg"
        };
        localstorageFactory.setIdUser(idUsuario);
    }

    $scope.confirmCancel = function () {
        if ($scope.takeDosisStatusButton) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Cancelar la Dosis',
                template: '¿Usted esta seguro de querer cancelar la dosis?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    console.log('You are sure');
                    var info = "data=" + setDosis(2);
                    console.log(info);
                    $http({
                        url: "http://www.e-siat.net/siat_webservice_test/index.php/dosis/setAplicada",
                        method: "POST",
                        data: info,
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    })
                   .success(function (data, status, headers, config) {
                       console.log('-->' + data[0]);
                       $window.location.reload(true);
                   })
                   .error(function (data) {
                       console.log('-->' + data[0]);
                       $window.location.reload(true);
                   });
                } else {
                    console.log('You are not sure');
                }
            });
        }
    }
   
    $scope.tomarDosis = function () {
        if ($scope.takeDosisStatusButton) {
           
            //var info = "data=" + JSON.stringify(setDosis(1));

            var info = 'data=[[],[{"activa":1,"aplicada":1,"cantidad":"","droga":"0","fechaHoraPrevisto":"2017-01-16 15:30:00","fechaHoraReal":"2017-1-20 12:11:59","idDetalleDroga":0,"idDosis":"23280","idTratamiento":"182","tipo":1}],[]]';
            console.log(info);
            $http({
                url: "http://www.e-siat.net/siat_webservice_test/index.php/dosis/setAplicada",
                method: "POST",
                data: info,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            })
           .success(function (data, status, headers, config) {
               $window.location.reload(true);
               console.log(data);
           })
           .error(function (data) {
               $window.location.reload(true);
               console.log(data);
           });
        }
    }

    //$ionicPlatform.ready(function () {
    //    var alarmTime;

    //    if (isNaN(($scope.dosisA * 1000) - 3600000)) {
    //        $scope.notificationIconColor = "C40505";
    //        $scope.notificationtext = "Aviso de Dosis retrasada";
    //        alarmTime = new Date();
    //        alarmTime.setMinutes(alarmTime.getMinutes());
    //    } else {
    //        $scope.notificationIconColor = "1288A5";
    //        $scope.notificationtext = "Ya puede Tomar la Dosis";
    //        alarmTime = ($scope.dosisA * 1000) - 3600000;
    //    }

    //    console.log(alarmTime);

    //    $cordovaLocalNotification.schedule({
    //        id: "1234",
    //        at: alarmTime,
    //        text: $scope.notificationtext,
    //        title: "Siat",
    //        icon: "res://ic_stat_36.png",
    //        color: $scope.notificationIconColor,
    //        sound: null
    //    }).then(function () {
    //        console.log("The notification has been set");
    //    });
    //});

}])

