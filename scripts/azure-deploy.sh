#!/usr/bin/env bash
# =============================================================================
# mrvoje.com (portfolio + the Plumcast page at plumcast.mrvoje.com) → Azure Static Web Apps (Free plan)
# BarMint (barmint.mrvoje.com) has its own app and script: repo hrvojehorvat/barmint.
#
# Meant to be run STEP BY STEP: copy each block into your terminal and check
# its output before going on. Running the whole file also works (it stops on
# the first error), but the steps marked [MANUAL] need you in the browser.
#
# What you end up with:
#   - Resource group  mrvoje-rg  (West Europe)
#   - Static Web App  mrvoje     (East US 2, Free plan, €0/month)
#   - GitHub secret with the deploy token
#   - GitHub Actions: every push to master → npm test → build → deploy
#   - Budget alert: email as soon as the subscription costs anything
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

# --- Settings ---------------------------------------------------------------
RG="mrvoje-rg"
APP="mrvoje"
LOCATION="westeurope"            # resource group (only metadata)
APP_LOCATION="eastus2"           # Free plan regions: westeurope, centralus, eastus2, westus2, eastasia
                                 # (westeurope refused new apps in Nov 2026; content is served worldwide anyway)
REPO="hrvojehorvat/mrvoje"
BUDGET_EUR=1                     # alert threshold base (in your billing currency)

# =============================================================================
# STEP 0 [MANUAL] — Subscription must be active
# After the 30-day trial the subscription is disabled until you upgrade it to
# Pay-As-You-Go: portal.azure.com → Subscriptions → your subscription →
# "Upgrade". Upgrading itself is free; you only pay for paid resources.
# =============================================================================

# =============================================================================
# STEP 1 — Log in and check the subscription
# Expect: state "Enabled". If it says "Disabled"/"Warned", do STEP 0 first.
# =============================================================================
az login
az account show --query "{name:name, id:id, state:state, user:user.name}" -o table

# If you have several subscriptions, pick one:
#   az account list -o table
#   az account set --subscription "<name or id>"

# =============================================================================
# STEP 2 — Register the provider used by Static Web Apps (one-time, free)
# =============================================================================
az provider register --namespace Microsoft.Web --wait

# =============================================================================
# STEP 3 — Resource group
# =============================================================================
az group create --name "$RG" --location "$LOCATION" -o table

# =============================================================================
# STEP 4 — Static Web App on the FREE plan
# Not linked to GitHub here on purpose: our own workflow (.github/workflows/
# deploy.yml) runs the tests before deploying.
# =============================================================================
az staticwebapp create \
  --name "$APP" \
  --resource-group "$RG" \
  --location "$APP_LOCATION" \
  --sku Free \
  -o table

# Verify the plan — MUST print "Free"
az staticwebapp show -n "$APP" -g "$RG" --query sku.name -o tsv

# =============================================================================
# STEP 5 — Put the deploy token into GitHub as a secret
# (piped directly, so the token is never printed or saved to a file)
# =============================================================================
az staticwebapp secrets list -n "$APP" -g "$RG" --query properties.apiKey -o tsv \
  | gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN --repo "$REPO"

gh secret list --repo "$REPO"

# =============================================================================
# STEP 6 — First deploy
# The workflow is already in the repo; until step 5 it only ran tests + build and
# skipped the deploy step. Now that the token exists, start a run by hand.
# =============================================================================
gh workflow run deploy.yml --repo "$REPO" --ref master
sleep 5

# Watch the run (Ctrl+C to stop watching; the run continues):
gh run watch --repo "$REPO" --exit-status \
  "$(gh run list --repo "$REPO" --workflow deploy.yml --limit 1 --json databaseId -q '.[0].databaseId')"

# =============================================================================
# STEP 7 — Check the live site
# =============================================================================
URL="https://$(az staticwebapp show -n "$APP" -g "$RG" --query defaultHostname -o tsv)"
echo "Live at: $URL"
curl -sI "$URL" | grep -iE "^HTTP|content-security-policy|strict-transport"

# Link previews need the absolute site URL baked into the build. Store it as a
# GitHub variable (not secret) and redeploy once. Change it later if you add a domain.
gh variable set VITE_SITE_URL --body "$URL" --repo "$REPO"
gh workflow run deploy.yml --repo "$REPO" --ref master

# =============================================================================
# STEP 8 — Budget alert (email when costs exceed 10 % of BUDGET_EUR)
# One budget for the whole subscription (all resource groups, BarMint's too), named "1-eur".
# It already exists; running this again only updates it.
# Pay-As-You-Go has no hard spending cap, so this is your safety net.
# Email goes to the address you log in to Azure with.
# =============================================================================
SUB_ID="$(az account show --query id -o tsv)"
ALERT_EMAIL="$(az account show --query user.name -o tsv)"
START="$(date -u +%Y-%m-01T00:00:00Z)"
END="$(date -u -v+5y +%Y-%m-01T00:00:00Z 2>/dev/null || date -u -d '+5 years' +%Y-%m-01T00:00:00Z)"

az rest --method put \
  --url "https://management.azure.com/subscriptions/$SUB_ID/providers/Microsoft.Consumption/budgets/1-eur?api-version=2023-05-01" \
  --body "{
    \"properties\": {
      \"category\": \"Cost\",
      \"amount\": $BUDGET_EUR,
      \"timeGrain\": \"Monthly\",
      \"timePeriod\": { \"startDate\": \"$START\", \"endDate\": \"$END\" },
      \"notifications\": {
        \"anyCost\": {
          \"enabled\": true,
          \"operator\": \"GreaterThan\",
          \"threshold\": 10,
          \"thresholdType\": \"Actual\",
          \"contactEmails\": [\"$ALERT_EMAIL\"]
        }
      }
    }
  }"

# =============================================================================
# LATER — useful commands
# =============================================================================
# Costs so far this month (should be 0):
#   az consumption usage list --query "[].{name:instanceName, cost:pretaxCost}" -o table
#
# Custom domains (Free plan: max 2 per app). DNS at Cloudflare, "DNS only" (grey cloud):
#   mrvoje.com (apex): flattened CNAME @ → <defaultHostname>, plus the TXT record Azure shows:
#     az staticwebapp hostname set -n "$APP" -g "$RG" --hostname mrvoje.com --validation-method dns-txt-token --no-wait
#     az staticwebapp hostname show -n "$APP" -g "$RG" --hostname mrvoje.com --query validationToken -o tsv
#   plumcast.mrvoje.com: CNAME plumcast → <defaultHostname>, then:
#     az staticwebapp hostname set -n "$APP" -g "$RG" --hostname plumcast.mrvoje.com
#
# Remove EVERYTHING (stops all costs, deletes the site):
#   az group delete --name "$RG" --yes
#   az rest --method delete --url "https://management.azure.com/subscriptions/$SUB_ID/providers/Microsoft.Consumption/budgets/1-eur?api-version=2023-05-01"
