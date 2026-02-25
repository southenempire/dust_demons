import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { DustDemons } from "../target/types/dust_demons";

describe("dust_demons", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.dustDemons as Program<DustDemons>;

  it("Spawns a demon!", async () => {
    const [demonPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("demon"), anchor.AnchorProvider.env().wallet.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .spawnDemon("Blinky")
      .accounts({
        demon: demonPda,
        user: anchor.AnchorProvider.env().wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    console.log("Your transaction signature", tx);

    const demonAccount = await program.account.demon.fetch(demonPda);
    console.log("Demon name:", demonAccount.name);
  });
});
