.PHONY: help install uninstall reinstall status

help:
	@echo "Reversa — instalação local (dev)"
	@echo ""
	@echo "Alvos disponíveis:"
	@echo "  make install     Instala 'reversa' globalmente via npm link (aponta para este checkout)"
	@echo "  make uninstall   Remove o link global do reversa"
	@echo "  make reinstall   Remove e reinstala (uninstall + install)"
	@echo "  make status      Mostra o caminho do binário 'reversa' resolvido no PATH"

install:
	@npm install --silent
	@npm link
	@echo ""
	@echo "✓ reversa linkado globalmente — execute 'reversa install' em qualquer projeto."
	@echo "  Edits no código deste repo refletem imediatamente."

uninstall:
	@npm unlink -g reversa || true
	@echo ""
	@echo "✓ reversa removido do escopo global."

reinstall: uninstall install

status:
	@which reversa || echo "reversa não está no PATH"
	@reversa --version 2>/dev/null || true
