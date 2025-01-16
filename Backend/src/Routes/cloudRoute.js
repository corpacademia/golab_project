const express  = require('express')


const {
  createLab,
  getAllLab,
  getLabOnId,
  assignLab,
  getAssignLabOnId,
  ec2Terraform,
  getInstanceOnParameters,
  getInstanceDetailsForPricing,
  getLabsConfigured,
  updateLabsOnConfig,
} = require('../Controllers/labController')

const Router = require("express")
const router = Router()

router.post('/labconfig',createLab)
router.get('/getCatalogues',getAllLab)
// router.post('/getLabOnId',getLabOnId)
router.post('/assignlab',assignLab)
router.post('/getlabonid',getAssignLabOnId)
router.post('/getInstances',getInstanceOnParameters)
router.post('/getInstanceDetails',getInstanceDetailsForPricing)
router.post('/getLabsConfigured',getLabsConfigured)
router.post('/updateConfigOfLabs',updateLabsOnConfig)
router.post('/python',ec2Terraform);


module.exports = router;