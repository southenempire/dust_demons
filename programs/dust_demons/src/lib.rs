use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"); 

#[program]
pub mod dust_demons {
    use super::*;

    pub fn spawn_demon(ctx: Context<SpawnDemon>, name: String) -> Result<()> {
        let demon = &mut ctx.accounts.demon;
        demon.owner = *ctx.accounts.user.key;
        demon.name = name;
        demon.level = 1;
        demon.xp = 0;
        demon.bump = ctx.bumps.demon;
        msg!("Spawned demon: {}", demon.name);
        Ok(())
    }

    pub fn feed_demon(ctx: Context<FeedDemon>, amount: u64) -> Result<()> {
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: ctx.accounts.demon.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, amount)?;

        let demon = &mut ctx.accounts.demon;
        demon.xp += amount; 
        let new_level = (demon.xp / 100_000_000) + 1;
        if new_level > demon.level as u64 {
            demon.level = new_level as u8;
        }
        Ok(())
    }

    #[account(mut, close = user, has_one = owner)]
    pub fn sacrifice_demon(ctx: Context<SacrificeDemon>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(name: String)]
pub struct SpawnDemon<'info> {
    #[account(init, payer = user, space = 8 + 32 + 4 + name.len() + 1 + 8 + 1, seeds = [b"demon", user.key().as_ref()], bump)]
    pub demon: Account<'info, Demon>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FeedDemon<'info> {
    #[account(mut, seeds = [b"demon", user.key().as_ref()], bump = demon.bump)]
    pub demon: Account<'info, Demon>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SacrificeDemon<'info> {
    #[account(mut, seeds = [b"demon", user.key().as_ref()], bump = demon.bump)]
    pub demon: Account<'info, Demon>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct Demon {
    pub owner: Pubkey,
    pub name: String,
    pub level: u8,
    pub xp: u64,
    pub bump: u8,
}