import assert from "node:assert/strict";
import { test } from "node:test";
import { hidesCallButton, siteRoutes } from "@/lib/routes";

test("C6 siteRoutes returns each public path", () => {
  assert.deepEqual(
    {
      home: siteRoutes.home,
      work: siteRoutes.work,
      about: siteRoutes.about,
      workWithMe: siteRoutes.workWithMe,
      book: siteRoutes.book,
      contact: siteRoutes.contact,
      capabilities: siteRoutes.capabilities,
      websites: siteRoutes.websites,
    },
    {
      home: "/",
      work: "/work",
      about: "/about",
      workWithMe: "/work-with-me",
      book: "/book",
      contact: "/contact",
      capabilities: "/capabilities",
      websites: "/websites",
    },
  );
  assert.equal(siteRoutes.caseStudy("everbook"), "/work/everbook");
});

test("C6 hidesCallButton is true for /book and everything under /websites", () => {
  for (const path of [
    "/book",
    "/book/handoff",
    "/websites",
    "/websites/platform",
    "/websites/coded/intake",
  ]) {
    assert.equal(hidesCallButton(path), true, path);
  }
});

test("C6 hidesCallButton is false for /, /work, /about and /work-with-me", () => {
  for (const path of [
    "/",
    "/work",
    "/work/everbook",
    "/about",
    "/work-with-me",
    "/bookings",
    "/websitesx",
  ]) {
    assert.equal(hidesCallButton(path), false, path);
  }
});
