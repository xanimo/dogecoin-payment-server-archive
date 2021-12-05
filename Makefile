build-regtest:
	docker build --network=host -t dogecoind_bob provision/

regtest:
	docker run -d --network=host --name dogecoind_regtest_bob dogecoind_bob

logs:
	docker logs -f dogecoind_regtest_bob

restart:
	docker start dogecoind_regtest_bob
	
clean-regtest:
	rm -rf data/regtest