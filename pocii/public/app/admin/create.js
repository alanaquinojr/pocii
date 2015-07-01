(function () {
    'use strict';

    // Organize the controller name and dependencies here for easy recognition
    var controllerId = 'create';
    angular.module('app').controller(controllerId, ['common', 'datacontext', createCtrl]);

    // This is our controller...  think of it as a controller with a view model in it
    function createCtrl(common, datacontext) {

        // Organizing all of the variables and functions here allows us to get a quick look at
        // what the controller is doing
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');

        var vm = this;
        vm.title = 'Create Nodes Setup';
        vm.drugs = [];
        vm.relationships = [];
        vm.relationshipTypes = ['Esta_Em', 'Par_Metálico', 'Cabo de Pares', 'EMBRATEL', 'TELESAT', 'Cabo UTP'];
        vm.nodeTypes = ['Local', 'DG', 'Vertical', 'Bloco', 'Par', 'Dispositivo'];


        // Our event handlers
        vm.addDrug = addDrug;
        vm.listAllDrugs = listAllDrugs;
        vm.deleteDrug = deleteDrug;
        vm.addRelationship = addRelationship;
        vm.deleteRelationship = deleteRelationship;
        vm.updateDrug = updateDrug;


        // Call this function when our controller is loaded
        activate();

        // ============  The work & logic   
        // ============  From here down we are implementing the functions that we defined above.  Clean organization.

        // The activate method takes care of any work that is needed to get the view up and running.
        // Things like calling a service to get data options for dropdowns, populate arrays, etc.
        // This convention will be used with all controllers.
        function activate() {
            var promises = [getAllNodes(), getAllRelationships()];
            common.activateController(promises, controllerId)
                .then(function () {
                    log('Activated Create View');
                });
        }

        // Get all drug nodes
        function getAllNodes() {
            return datacontext.getAllNodes().then(function (result) {
                return vm.drugs = result.data.responseData;
            });
        }

        //    Get all relationships
        function getAllRelationships() {
            return datacontext.getAllRelationships().then(function (result) {
                return vm.relationships = result.data.responseData;
            });
        }

        // Add a drug node
        function addDrug() {
            if (vm.newDrugName == undefined){
            logError('Preencha o campo Nome para adicionar um ponto');
            return;
        }

            var newDrug = {type:vm.relation, name: vm.newDrugName, description: vm.newDrugDescription, citcuit:vm.ckt };

            datacontext.addNode(newDrug).then(
                function(result) {
                    if (result.data.error==null){
                        vm.drugs.push({n:result.data.responseData});
                        log('Added: ' + vm.newDrugName);
                        vm.newDrugName = null; vm.newDrugDescription = '';vm.ckt = ''
                    }
                    else
                        log(result.data.error);

                });
           
           
        }

        function updateDrug(){
            if (vm.selectedDrug ==undefined){
                logError('Escolha um ponto para atualizar');
                return;
            }
            datacontext.updateNode(vm.selectedDrug.n.id,vm.selectedDrug.n.data).then(
                function() {
                    log('Modificado :' + vm.selectedDrug.n.data.name);
                });

            }



        function listAllDrugs(){
            return vm.drugs.toString();
        }
        
        // Delete a drug node. API takes care of deleting attached relationships
        function deleteDrug(){

            if (vm.selectedDrugForDelete==undefined)
                return;

            datacontext.deleteNode(vm.selectedDrugForDelete.n.id).then(
            function() {
                var index=vm.drugs.indexOf(vm.selectedDrugForDelete);
                vm.drugs.splice(index,1); 
                getAllRelationships();
                log('Deleted: ' + vm.selectedDrugForDelete.n.data.name);

            });
            
        }

        //Given 2 nodes and a relationship, create that relationship
        function addRelationship(){

            if(vm.relationshipFrom ==undefined  || vm.relationshipTo == undefined || vm.relation == undefined ){
                logError('All fields should be selected to create a relationship');    
                return; 
            }
            datacontext.createRelationshipByNodeId(vm.relationshipFrom.n.id, vm.relationshipTo.n.id, vm.relation, vm.relationshipDescription)
                .then(function(result){
                    getAllRelationships();
                    log('Relationship created');
                    vm.relationshipFrom = null; vm.relationshipTo = null; vm.relation = null
                });
                
        }

        // delete selected relationship
        function deleteRelationship(){

            if(vm.selectedRelationshipToDelete == undefined){
                return; 
            }
            datacontext.deleteRelationshipByNodeId(vm.selectedRelationshipToDelete.n.id, vm.selectedRelationshipToDelete.m.id, vm.selectedRelationshipToDelete.r.type, vm.selectedRelationshipToDelete.r.data)
                .then(function(result){
                    var index=vm.relationships.indexOf(vm.selectedRelationshipToDelete);
                    vm.relationships.splice(index,1); 
                    log('Relationship deleted');
                });
                
        }



    }
})();
