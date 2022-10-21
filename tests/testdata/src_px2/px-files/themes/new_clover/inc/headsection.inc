<?php /*
すべての layout について共通の、headセクションの記述
*/ ?>

		<meta name="viewport" content="width=device-width, initial-scale=1" />

<?= $px->get_contents_manifesto(); ?>

		<style>
		:root {
			--theme-keycolor: #00a0e6;
			--theme-textcolor-on-keycolor: #eee;
			--theme-subcolor: #00a0e6;
			--theme-textcolor-on-subcolor: #eee;
		}
		</style>
		<link rel="stylesheet" href="<?= htmlspecialchars( $theme->files('/modules.css') ); ?>" />
		<link rel="stylesheet" href="<?= htmlspecialchars( $theme->files('/styles/theme.css') ); ?>">
