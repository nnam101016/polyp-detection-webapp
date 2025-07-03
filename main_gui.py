from nicegui import app, ui

app.add_static_files('/bgs', 'bgs')

ui.add_head_html("""
<style>
body {
    background-image: url('/bgs/bg1.avif');
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
}
</style>
""")

ui.run()