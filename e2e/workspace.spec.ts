import { test, expect } from '@playwright/test';
import { resetDatabase } from './helpers/db';

test.describe('Workspace & Board CRUD', () => {
  // Reset database before each test to ensure isolation
  test.beforeEach(() => {
    resetDatabase();
  });

  test('should display empty state when no boards exist', async ({ page }) => {
    await page.goto('/');

    // Verify title
    await expect(page.locator('h1')).toHaveText('Your Boards');

    // Verify empty state
    await expect(page.getByText('No boards found. Create your first board!')).toBeVisible();
  });

  test('should create a new board', async ({ page }) => {
    await page.goto('/');

    // Open create dialog
    await page.getByRole('button', { name: 'New Board' }).click();

    // Verify dialog is open
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill form
    await page.getByLabel('Board Title').fill('E2E Test Board');
    await page.getByRole('button', { name: 'Create Board' }).click();

    // Verify dialog closed
    await expect(page.getByRole('dialog')).toBeHidden();

    // Verify new board appears using accessible heading
    await expect(page.getByRole('heading', { name: 'E2E Test Board' })).toBeVisible();
  });

  test('should delete a board', async ({ page }) => {
    // ARRANGE: Create a board specifically for this test
    await page.goto('/');
    await page.getByRole('button', { name: 'New Board' }).click();
    await page.getByLabel('Board Title').fill('Board To Delete');
    await page.getByRole('button', { name: 'Create Board' }).click();

    const boardTitle = 'Board To Delete';
    const boardHeading = page.getByRole('heading', { name: boardTitle });

    // Ensure board exists
    await expect(boardHeading).toBeVisible();

    // Setup dialog handler BEFORE the action that triggers it
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain(`Are you sure you want to delete "${boardTitle}"?`);
      await dialog.accept();
    });

    // ACT: Delete the board
    // Find the card container (parent of heading) to find the delete button
    // Or traverse up from heading.
    // We can just find the delete button near the heading.
    // Or stick to filtering for this interaction to find the specific delete button.
    const boardCard = page.locator('div').filter({ hasText: boardTitle }).first();

    await boardCard.hover();
    await boardCard.getByLabel('Delete board').click();

    // ASSERT: Verify removal
    await expect(boardHeading).toBeHidden();

    // Verify empty state returns
    await expect(page.getByText('No boards found. Create your first board!')).toBeVisible();
  });
});
