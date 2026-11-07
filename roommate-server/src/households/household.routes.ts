import { Router } from "express";
import { HouseholdController } from "@src/households/household.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";
import authorizeHousehold from "@src/auth/middlewares/authorizeHousehold";

const householdRouter = Router();

householdRouter.post(
  "/create",
  ensureAuthenticated,
  HouseholdController.create,
);

householdRouter.post(
  "/join/:inviteCode",
  ensureAuthenticated,
  HouseholdController.join,
);

householdRouter.get(
  "/all",
  ensureAuthenticated,
  HouseholdController.getHouseholdsByUser,
);

householdRouter.post(
  "/delete",
  ensureAuthenticated,
  authorizeHousehold({ requireAdmin: true }),
  HouseholdController.delete,
);

householdRouter.post(
  "/update",
  ensureAuthenticated,
  authorizeHousehold({ requireAdmin: true }),
  HouseholdController.update,
);

householdRouter.get(
  "/:householdId/kitchen-table",
  ensureAuthenticated,
  authorizeHousehold(),
  HouseholdController.getKitchenTable,
);

householdRouter.post(
  "/:householdId/kitchen-table/broadcast",
  ensureAuthenticated,
  authorizeHousehold(),
  HouseholdController.broadcastKitchenTable,
);

householdRouter.post(
  "/:householdId/kitchen-table/rsvp",
  ensureAuthenticated,
  authorizeHousehold(),
  HouseholdController.toggleKitchenTableRsvp,
);

householdRouter.post(
  "/:householdId/kitchen-table/notice/ack",
  ensureAuthenticated,
  authorizeHousehold(),
  HouseholdController.acknowledgeNotice,
);

import { ActivityController } from "@src/activities/activity.controller";

householdRouter.post(
  "/:householdId/kitchen-table/qna/reply",
  ensureAuthenticated,
  authorizeHousehold(),
  HouseholdController.replyQna,
);

householdRouter.get(
  "/:householdId/activities",
  ensureAuthenticated,
  authorizeHousehold(),
  ActivityController.getFeed,
);

householdRouter.post(
  "/:householdId/activities/:activityId/react",
  ensureAuthenticated,
  authorizeHousehold(),
  ActivityController.toggleReaction,
);

export default householdRouter;
