# Add some explanation to "Releases" page
Imported from: opensafely-job-server-good-first-issue
Repository: opensafely-core/job-server
Issue: #1261 https://github.com/opensafely-core/job-server/issues/1261
Issue author: HelenCEBM
Labels: documentation, enhancement, good first issue, outputs
Created: 2021-11-05T10:50:33Z
Updated: 2026-05-31T09:19:47Z
Comments: 1
## Source Rationale
OpenSAFELY supports secure, reproducible health research workflows used for public-health analysis.
Source note: Restrict work to public code, docs, tests, and developer workflow artifacts. Do not use patient data.
## Issue Body Excerpt
The releases section contains two headers but without explanation ([example](https://jobs.opensafely.org/nhsei/prostate-cancer-psa-testing/prostate_cancer_psa_testing_2021/)):
![image](https://user-images.githubusercontent.com/24392156/140498265-68c3bcee-21ff-49df-b91d-3c2db2ff8f7c.png)

1. Could add at the end of the blurb "... and view outputs"

2. Suggest explanatory text for each item such as:
  - Level 4 outputs - these outputs can only be accessed within the secure (Level 4) environment by authorised users
  - Released outputs - these outputs have been released from the secure server following output checking. If any outputs have been Published, they will be publicly accessible here, otherwise released files are accessible to authorised users only. 

3. Possibly it could be helpful to rename / regroup. 
  - E.g. instead of "Level 4" (bit obscure for users who have e.g. followed a link from a publication and are unfamiliar with OpenSAFELY) could say "unreleased" or "pre-release" or something like that. 
  - It's a bit confusing that non-released data is under a "releases" heading...