import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  safeName,
  uploadTarget,
  nextFolderName,
  slugify,
  validateStory,
  publishPaths,
  commitMessage,
} from "../lib/admin/core.ts";

const CATS = ["kasaysayan", "kultura", "lugar", "pagkain", "hayop", "wika", "tao", "misteryo"];
const DIR = "content/stories/005_rizal_asimilasyon";
const realSite = () => JSON.parse(fs.readFileSync(`${DIR}/site.json`, "utf-8"));
const realCaption = () => fs.readFileSync(`${DIR}/caption.txt`, "utf-8");

test("safeName accepts plain names and rejects traversal", () => {
  assert.equal(safeName("005_rizal"), true);
  assert.equal(safeName("01_hook.jpg"), true);
  for (const bad of ["../x", "a/b", "a\\b", "", "..", ".hidden"]) assert.equal(safeName(bad), false, bad);
});

test("uploadTarget maps each kind to its path", () => {
  assert.equal(uploadTarget("video", "005_r", "rizal", "x.mp4"), "public/videos/rizal.mp4");
  assert.equal(uploadTarget("vtt", "005_r", "rizal", "x.vtt"), "public/videos/rizal.vtt");
  assert.equal(uploadTarget("poster", "005_r", "rizal", "p.jpg"), "public/videos/rizal-poster.jpg");
  assert.equal(uploadTarget("thumbnail", "005_r", "rizal", "t.jpg"), "content/stories/005_r/thumbnail.jpg");
  assert.equal(uploadTarget("story", "005_r", "rizal", "s.json"), "content/stories/005_r/story.json");
  assert.equal(uploadTarget("card", "005_r", "rizal", "01_hook.jpg"), "public/cards/rizal/01_hook.jpg");
  assert.throws(() => uploadTarget("card", "005_r", "rizal", "../evil.jpg"));
  assert.throws(() => uploadTarget("video", "../x", "rizal", "a.mp4"));
  assert.throws(() => uploadTarget("video", "005_r", "a/b", "a.mp4"));
});

test("nextFolderName picks the next number", () => {
  assert.deepEqual(nextFolderName(["001_a", "005_b"], "tarsier-bohol"), { folder: "006_tarsier_bohol", number: 6 });
  assert.deepEqual(nextFolderName([], "x"), { folder: "001_x", number: 1 });
});

test("slugify", () => {
  assert.equal(slugify("Gusto ba ni Rizal?"), "gusto-ba-ni-rizal");
  assert.equal(slugify("Ñino José"), "nino-jose");
  assert.ok(slugify("a ".repeat(100)).length <= 60);
  assert.ok(!slugify("a ".repeat(100)).endsWith("-"));
});

test("validateStory passes a real story", () => {
  assert.deepEqual(validateStory({ site: realSite(), caption: realCaption(), hasStoryJson: true }, CATS), []);
});

test("validateStory flags missing sources", () => {
  const errs = validateStory({ site: realSite(), caption: "Just a caption", hasStoryJson: true }, CATS);
  assert.ok(errs.some((e) => /source/i.test(e)), errs.join("|"));
});

test("validateStory flags missing story.json", () => {
  const errs = validateStory({ site: realSite(), caption: realCaption(), hasStoryJson: false }, CATS);
  assert.ok(errs.some((e) => /story\.json/.test(e)), errs.join("|"));
});

test("validateStory flags out-of-range quiz answer", () => {
  const site = realSite();
  site.quiz[0].answer = 5;
  const errs = validateStory({ site, caption: realCaption(), hasStoryJson: true }, CATS);
  assert.ok(errs.some((e) => /quiz/i.test(e)), errs.join("|"));
});

test("validateStory flags bad category, date and empty title", () => {
  const site = { ...realSite(), category: "nope", published: "13/11/2026", title: "" };
  const errs = validateStory({ site, caption: realCaption(), hasStoryJson: true }, CATS);
  assert.ok(errs.some((e) => /category/i.test(e)));
  assert.ok(errs.some((e) => /published/i.test(e)));
  assert.ok(errs.some((e) => /title/i.test(e)));
});

test("publishPaths and commitMessage", () => {
  assert.deepEqual(publishPaths("005_r", "rizal"), [
    "content/stories/005_r",
    "public/videos/rizal.mp4",
    "public/videos/rizal.vtt",
    "public/videos/rizal-poster.jpg",
    "public/cards/rizal",
  ]);
  assert.equal(commitMessage(5, "rizal"), "content: publish story 005 rizal");
});
