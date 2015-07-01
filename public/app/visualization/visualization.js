(function () {
  'use strict';

  var controllerId = 'visualization';
  angular.module('app').controller(controllerId, ['common', 'datacontext', visualization]);

  function visualization(common, datacontext) {

    var getLogFn = common.logger.getLogFn;
    var log = getLogFn(controllerId);

    var vm = this;
    vm.title = 'Visualizações';
    vm.nodes = [];
    vm.sampleQueries = [
      {name: 'Retorne todos os Nós',
        query: ['Match (n)',
          'Return n'
        ].join('\n')
      },
      {name: 'Retorne Todas as ligações',
        query: ['Match n-[r]->m',
          'Return n,r,m'
        ].join('\n')},

    ];
    vm.runQuery = runQuery;

    activate();

    function activate() {
      var promises = [];
      common.activateController(promises, controllerId)
          .then(function () { log('Activated Visus Query View'); });
    }

    function runQuery() {
      return datacontext.runAdhocQuery(vm.query).then(function (result) {
        return vm.nodes = result.data;
      });
    }

  }
})();

