/* jshint camelcase: false */
/* jshint newcap: false */
/* global describe, before, it */

var _ = require('underscore');
var logule = require('logule');
var should = require('should');
var sinon = require('sinon');
var uuid = require('node-uuid');
var service = require('../../../../lib/services/azurerediscache/service.json');
var handlers = require('../../../../lib/services/azurerediscache/index');
var redisClient = require('../../../../lib/services/azurerediscache/client');
var resourceGroupClient = require('../../../../lib/common/resourceGroup-client');

var azure = {
    environment: 'AzureCloud',
    subscription_id: '743fxxxx-83xx-46xx-xx2d-xxxxb953952d',
    tenant_id: '72xxxxbf-8xxx-xxxf-9xxb-2d7cxxxxdb47',
    client_id: 'd8xxxx18-xx4a-4xx9-89xx-9be0bfecxxxx',
    client_secret: '2/DzYYYYYYYYYYsAvXXXXXXXXXXQ0EL7WPxEXX115Go=',
};
  
var log = logule.init(module, 'Redis Cache-Tests');
var generatedValidInstanceId = uuid.v4();
var provisioningResult = "{\"id\":\"/subscriptions/" + azure.subscription_id + "/resourceGroups/redisResourceGroup/providers/Microsoft.Cache/Redis/C0CacheE\",\"name\":\"C0CacheE\",\"type\":\"Microsoft.Cache/Redis\",\"location\":\"East US\",\"tags\":{},\"accessKeys\":{\"primaryKey\":\"4eEobxjSUnBjAHYWGO+0M69/XikkJv6+EPiaXMjfNJg=\",\"secondaryKey\":\"Zb3e6FZAwzJS60eBbN7sLTFp76UdWfhFno99Pal/dL0=\"},\"provisioningState\":\"Creating\",\"hostName\":\"C0CacheE.redis.cache.windows.net\",\"port\":6379,\"sslPort\":6380,\"redisVersion\":\"3.0\",\"sku\":{\"name\":\"Basic\",\"family\":\"C\",\"capacity\":0},\"redisConfiguration\":{\"maxclients\":\"256\",\"maxmemory-reserved\":\"2\",\"maxmemory-delta\":\"2\"},\"enableNonSslPort\":false}";

describe('RedisCache - Index - Provision', function() {
    var validParams;
    
    before(function() {
        validParams = {
            instance_id: generatedValidInstanceId,
            service_id: service.id,
            plan_id: service.plans[0].id,
            azure: azure,
            parameters: {
                resourceGroup: 'redisResourceGroup',
                cacheName: 'C0CacheE',
                parameters: {
                    location:'eastus',
                    redisVersion: '3.0',
                    enableNonSslPort: false,
                    sku: {
                        name: 'Basic',
                        family: 'C',
                        capacity: 0
                    }
                }
            }
        }
    });
    
    after(function() {
        redisClient.provision.restore();
        resourceGroupClient.checkExistence.restore();
        resourceGroupClient.createOrUpdate.restore();
    });
    
    describe('Provision operation should succeed', function() {        
        it('should not return an error and statusCode should be 202', function(done) {

            sinon.stub(resourceGroupClient, 'checkExistence').yields(null, false);
            sinon.stub(resourceGroupClient, 'createOrUpdate').yields(null, {provisioningState: 'Succeeded'});
            sinon.stub(redisClient, 'provision').yields(null, JSON.parse(provisioningResult));
            handlers.provision(log, validParams, function(err, reply, result) {
                should.not.exist(err);
                reply.statusCode.should.equal(202);
                done();
            });
                        
        });
    });
});

describe('RedisCache - Index - Poll existing cache', function() {
    var validParams;
    
    before(function() {
        validParams = {
            instance_id: generatedValidInstanceId,
            service_id: service.id,
            plan_id: service.plans[0].id,
            last_operation: 'provision',
            provisioning_result: provisioningResult,
            azure: azure,
            parameters: {
                resourceGroup: 'redisResourceGroup',
                cacheName: 'C0CacheE',
                parameters: {
                    location:'eastus',
                    redisVersion: 3.0,
                    enableNonSslPort: false,
                    sku: {
                        name: 'Basic',
                        family: 'C',
                        capacity: 0
                    }
                }
            }
        }
    });
    
    after(function() {
        redisClient.poll.restore();
    });
    
    describe('Poll operation should succeed for existing cache', function() {        
        it('should not return an error and statusCode should be 200', function(done) {
            
            sinon.stub(redisClient, 'poll').yields(null, {provisioningState : 'Succeeded'});
            handlers.poll(log, validParams, function(err, reply, result) {
                should.not.exist(err);
                reply.statusCode.should.equal(200);
                done();
            });
                        
        });
    });
});

describe('RedisCache - Index - Bind existing cache', function() {
    var validParams;
    
    before(function() {
        validParams = {
            instance_id: generatedValidInstanceId,
            service_id: service.id,
            plan_id: service.plans[0].id,
            last_operation: 'provision',
            provisioning_result: provisioningResult,
            azure: azure,
            parameters: {
                resourceGroup: 'redisResourceGroup',
                cacheName: 'C0CacheE',
                parameters: {
                    location:'eastus',
                    redisVersion: 3.0,
                    enableNonSslPort: false,
                    sku: {
                        name: 'Basic',
                        family: 'C',
                        capacity: 0
                    }
                }
            }
        }
    });
    
    describe('Bind operation should succeed for existing cache', function() {        
        it('should not return an error and statusCode should be 201', function(done) {
            
            handlers.bind(log, validParams, function(err, reply, result) {
                should.not.exist(err);
                reply.statusCode.should.equal(201);
                reply.code.should.equal('Created');
                done();
            });
                        
        });
    });
});

describe('RedisCache - Index - De-provision existing cache', function() {
    var validParams;
    
    before(function() {
        validParams = {
            instance_id: generatedValidInstanceId,
            service_id: service.id,
            plan_id: service.plans[0].id,
            last_operation: 'provision',
            provisioning_result: provisioningResult,
            azure: azure
        }
    });
    
    after(function() {
        redisClient.deprovision.restore();
    });
    
    describe('De-Provision operation should succeed for existing cache', function() {        
        it('should not return an error and statusCode should be 202', function(done) {
            
            sinon.stub(redisClient, 'deprovision').yields(null, {provisioningState : 'Succeeded'});
            handlers.deprovision(log, validParams, function(err, reply, result) {
                should.not.exist(err);
                reply.statusCode.should.equal(202);
                done();
            });
                        
        });
    });
});

describe('RedisCache - Index - Poll de-provisioned cache', function() {
// there is a record in the 'instances' table, so there is parameters and provisioningResult
var validParams;
    
    before(function() {
        validParams = {
            instance_id: generatedValidInstanceId,
            service_id: service.id,
            plan_id: service.plans[0].id,
            last_operation: 'deprovision',
            provisioning_result: provisioningResult,
            azure: azure,
            parameters: {
                resourceGroup: 'redisResourceGroup',
                cacheName: 'C0CacheE',
                parameters: {
                    location:'eastus',
                    redisVersion: 3.0,
                    enableNonSslPort: false,
                    sku: {
                        name: 'Basic',
                        family: 'C',
                        capacity: 0
                    }
                }
            }        
        }
    });
    
    after(function() {
        redisClient.poll.restore();
    });
    
    describe('Poll operation should succeed for de-provisioned cache', function() {        
        it('should not return an error and statusCode should be 200', function(done) {
            
            sinon.stub(redisClient, 'poll').yields(null, {statusCode : 404});
            handlers.poll(log, validParams, function(err, reply, result) {
                should.not.exist(err);
                reply.statusCode.should.equal(200);
                done();
            });
                        
        });
    });
});

