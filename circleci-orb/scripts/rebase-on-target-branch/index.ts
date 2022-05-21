#!/usr/bin/env node

const circleBaseRevision = process.env.CIRCLE_BASE_REVISION;
const circleBranch = process.env.CIRCLE_BRANCH;

console.error('Works', circleBaseRevision, circleBranch);
