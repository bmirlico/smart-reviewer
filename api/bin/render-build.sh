#!/usr/bin/env bash
# Render build script — runs on every deploy of the api Web Service.
# Documented at https://render.com/docs/deploy-rails-8#create-a-build-script
#
# Why a script (vs an inline buildCommand in render.yaml)?
#   - The yaml stays declarative ("here are my services") instead of carrying
#     procedural shell logic.
#   - You can run this same script locally to reproduce the exact build steps
#     that Render runs (great for debugging "works on my machine" issues).
#
# `set -o errexit` stops the script on the first failing command, so we never
# move on to creating Mongo indexes if `bundle install` already broke.
set -o errexit

# Install Ruby gems from Gemfile.lock. With BUNDLE_DEPLOYMENT=true (set as a
# Render env var), this is strictly deterministic — bundler refuses to mutate
# the lockfile or fall back to other versions.
bundle install

# Idempotent: Mongoid checks each declared index on the Result model and only
# creates the ones that don't already exist on the Atlas collection. Safe to
# run on every deploy.
bundle exec rake db:mongoid:create_indexes
