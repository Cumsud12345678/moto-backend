const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUser,
  warningUser,
  lockUser,
  unlockUser,
  resetWarningUser,
  deleteUser,
  updateUser,
  getUserStats,

  getDeletedUsers,
  deleteDeletedUser,

  getDeletedUser
} = require('../../controllers/admin/adminUser.controller');

router.get('/', getUsers)
router.get('/search', getUser)

router.put('/warning/:id', warningUser)
router.put('/lock/:id', lockUser)
router.put('/unlock/:id', unlockUser)
router.put('/reset/warning/:id', resetWarningUser)
router.put('/update', updateUser)
router.get('/stats', getUserStats)

router.get('/deleted', getDeletedUsers)
router.get('/deleted/search', getDeletedUser)
router.delete('/deleted/:id', deleteDeletedUser)

router.delete('/:id', deleteUser)

module.exports = router