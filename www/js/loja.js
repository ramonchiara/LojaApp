var app = angular.module('starter');

app.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
            .state('principal', {
                url: '/',
                templateUrl: 'views/principal.html',
                controller: 'principalCtrl'
            })
            .state('produto', {
                url: '/produto/:id',
                templateUrl: 'views/produto.html',
                controller: 'produtoCtrl'
            })
            .state('filtros', {
                url: '/filtros',
                templateUrl: 'views/filtros.html',
                controller: 'filtrosCtrl'
            });

    $urlRouterProvider.otherwise('/');

});

app.controller('principalCtrl', function ($scope, $produtos, $filtros, $location, $ionicLoading, $ionicPopup) {

    $scope.produtos = [];
    $scope.produtosLoaded = false;

    $ionicLoading.show({
        template: "Carregando Produtos..."
    }).then(function () {
        $produtos.load().then(function (produtos) {
            $scope.produtos = produtos;
            $scope.produtosLoaded = true;
            $filtros.setMax($produtos.getMaior());
            $ionicLoading.hide();
        }, function (error) {
            $ionicPopup.alert({
                title: 'Erro!',
                template: 'Não foi possível carregar a lista de produtos. Tente novamente mais tarde...'
            });
            $ionicLoading.hide();
        });
    });

    $scope.showFilters = function () {
        $location.path('/filtros');
    };

    $scope.filtro = function (value, index, array) {
        return value.preco >= $filtros.getMin() && value.preco <= $filtros.getMax();
    };

});

app.controller('produtoCtrl', function ($scope, $produtos, $stateParams) {

    $scope.produto = $produtos.get($stateParams.id);

});

app.controller('filtrosCtrl', function ($scope, $produtos, $filtros, $timeout) {

    $scope.maior = $produtos.getMaior();
    $timeout(function () {
        $scope.min = $filtros.getMin();
        $scope.max = $filtros.getMax();
    }, 10);

    $scope.updateMin = function (v) {
        $filtros.setMin(v);
    };
    $scope.updateMax = function (v) {
        $filtros.setMax(v);
    };

});

app.service('$produtos', function ($http, $q) {

    var produtos = [];

    return {
        load: function () {
            return $q(function (resolve, reject) {
                if (produtos.length === 0) {
                    $http.get('produtos.json')
                            .then(function (response) {
                                produtos = response.data.produtos;
                                resolve(produtos);
                            }, function (error) {
                                reject(error);
                            });
                } else {
                    resolve(produtos);
                }
            });
        },

        get: function (id) {
            var produto = null;

            for (i in produtos) {
                if (produtos[i].id == id) {
                    produto = produtos[i];
                    break;
                }
            }

            return produto;
        },

        getMaior: function () {
            return Math.max.apply(null, produtos.map(function (produto) {
                return produto.preco;
            }));
        }
    };

});

app.service('$filtros', function () {

    var min = 0;
    var max = 0;

    return {
        getMin: function () {
            return min;
        },
        getMax: function () {
            return max;
        },
        setMin: function (v) {
            min = v;
        },
        setMax: function (v) {
            max = v;
        }
    };

});
