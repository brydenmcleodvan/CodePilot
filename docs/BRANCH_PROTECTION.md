# Main Branch Protection Guidelines

This repository currently has no branch protection rules configured. To reduce the risk of accidental changes affecting production, protect the `main` branch using GitHub's branch protection settings.

## Recommended Settings

1. **Require pull request reviews**
   - All commits must go through a pull request.
   - Enable "Require approvals" to ensure at least one reviewer signs off.
2. **Require status checks to pass before merging**
   - Add any CI workflows so merges only happen when tests succeed.
3. **Disallow force pushes and deletions**
   - Prevent rewriting history or deleting the branch.
4. **Include administrators**
   - Apply the rules to repository administrators as well.

## Enabling Branch Protection

1. Navigate to your repository on GitHub.
2. Go to **Settings** → **Branches**.
3. Under **Branch protection rules**, click **Add rule**.
4. Enter `main` as the branch name pattern and select the options above.
5. Save the rule.

Once enabled, all changes must be made through pull requests that pass CI and receive review before merging into `main`.
