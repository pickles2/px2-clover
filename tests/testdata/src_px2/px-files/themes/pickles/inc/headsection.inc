<?php /*
すべての layout について共通の、headセクションの記述
*/ ?>

<meta name="viewport" content="width=device-width" />
<meta name="keywords" content="<?= htmlspecialchars($px->site()->get_current_page_info('keywords')); ?>" />
<meta name="description" content="<?= htmlspecialchars($px->site()->get_current_page_info('description')); ?>" />

<?= $px->get_contents_manifesto(); ?>

<style>
html, body {
	background-color: #f9f9f9;
}
</style>
