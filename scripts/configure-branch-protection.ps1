param(
  [Parameter(Mandatory = $true)]
  [string] $Owner,

  [Parameter(Mandatory = $true)]
  [string] $Repo,

  [Parameter(Mandatory = $true)]
  [string] $Token,

  [string] $MainStatusCheck = "app-ci",

  [string] $DevelopStatusCheck = "app-ci"
)

$ErrorActionPreference = "Stop"

$headers = @{
  Accept                 = "application/vnd.github+json"
  Authorization          = "Bearer $Token"
  "X-GitHub-Api-Version" = "2022-11-28"
}

function Get-GitHubResponseStatus {
  param($ErrorRecord)

  if ($ErrorRecord.Exception.Response -and $ErrorRecord.Exception.Response.StatusCode) {
    return [int] $ErrorRecord.Exception.Response.StatusCode
  }

  return 0
}

function Ensure-BranchExists {
  param(
    [string] $Branch,
    [string] $SourceBranch = "main"
  )

  $branchUri = "https://api.github.com/repos/$Owner/$Repo/git/ref/heads/$Branch"

  try {
    Invoke-RestMethod -Method Get -Uri $branchUri -Headers $headers | Out-Null
    Write-Host "Branch '$Branch' already exists."
    return
  }
  catch {
    if ((Get-GitHubResponseStatus $_) -ne 404) {
      throw
    }
  }

  if ($Branch -eq $SourceBranch) {
    throw "Branch '$Branch' does not exist and cannot be created from itself."
  }

  $sourceUri = "https://api.github.com/repos/$Owner/$Repo/git/ref/heads/$SourceBranch"
  $sourceRef = Invoke-RestMethod -Method Get -Uri $sourceUri -Headers $headers
  $body = @{
    ref = "refs/heads/$Branch"
    sha = $sourceRef.object.sha
  } | ConvertTo-Json

  Invoke-RestMethod -Method Post -Uri "https://api.github.com/repos/$Owner/$Repo/git/refs" -Headers $headers -Body $body -ContentType "application/json" | Out-Null
  Write-Host "Created branch '$Branch' from '$SourceBranch'."
}

function Set-BranchProtection {
  param(
    [string] $Branch,
    [string] $StatusCheck,
    [int] $RequiredApprovals
  )

  $body = @{
    required_status_checks          = @{
      strict   = $true
      contexts = @($StatusCheck)
    }
    enforce_admins                  = $true
    required_pull_request_reviews   = @{
      dismiss_stale_reviews           = $true
      require_code_owner_reviews      = $false
      required_approving_review_count = $RequiredApprovals
      require_last_push_approval      = $false
    }
    restrictions                    = $null
    required_linear_history         = $false
    allow_force_pushes              = $false
    allow_deletions                 = $false
    block_creations                 = $false
    required_conversation_resolution = $false
    lock_branch                     = $false
    allow_fork_syncing              = $true
  } | ConvertTo-Json -Depth 10

  $uri = "https://api.github.com/repos/$Owner/$Repo/branches/$Branch/protection"
  Invoke-RestMethod -Method Put -Uri $uri -Headers $headers -Body $body -ContentType "application/json" | Out-Null
  Write-Host "Configured protection for $Branch with required check '$StatusCheck'."
}

Ensure-BranchExists -Branch "main"
Ensure-BranchExists -Branch "develop" -SourceBranch "main"
Set-BranchProtection -Branch "main" -StatusCheck $MainStatusCheck -RequiredApprovals 1
Set-BranchProtection -Branch "develop" -StatusCheck $DevelopStatusCheck -RequiredApprovals 0
